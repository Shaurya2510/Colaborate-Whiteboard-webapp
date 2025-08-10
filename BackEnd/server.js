const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const {
    addUser,
    getUser,
    removeUser,
    getUsersInRoom,
    updateUserPermission
} = require("./utils/user");

const app = express();
const server = http.createServer(app);

app.use(cors({
    origin: "https://colaborate-whiteboard-webapp-v1kp.vercel.app",
    methods: ["GET", "POST"]
}));

const io = new Server(server, {
    cors: {
        origin: "https://colaborate-whiteboard-webapp-v1kp.vercel.app",
        methods: ["GET", "POST"]
    }
});

// Track active rooms
const activeRooms = new Set();
const whiteboardData = {};

io.on("connection", (socket) => {
    socket.on("update-draw-permission", ({ roomId, targetUserId, canDraw }) => {
        updateUserPermission(roomId, targetUserId, canDraw);
        const updatedUsers = getUsersInRoom(roomId);
        io.to(roomId).emit("users-updated", updatedUsers);

        const targetUser = updatedUsers.find(u => u.userId === targetUserId);
        if (targetUser) {
            io.to(targetUser.socketId).emit("draw-permission-updated", canDraw);
        }
    });

    socket.on('user-joined', (userData) => {
        const { name, id: roomId, userId, host } = userData;

        // Host trying to create a room
        if (host) {
            // Check if the room already exists
            if (activeRooms.has(roomId)) {
                // If it does, prevent a new room from being created with the same ID.
                // The client should handle this case if a host tries to create a room with an existing ID.
                socket.emit('room-exists');
                return;
            }
            activeRooms.add(roomId);
            // Initialize an empty whiteboard for the new room
            whiteboardData[roomId] = [];
        } else {
            // Non-host trying to join a room
            if (!activeRooms.has(roomId)) {
                // If the room doesn't exist, send an explicit message back to the client
                socket.emit('room-not-found');
                return;
            }
        }

        socket.join(roomId);

        const user = {
            name,
            id: roomId,
            userId,
            host,
            presenter: !!host, // Only hosts can be presenters by default
            socketId: socket.id
        };

        const users = addUser(user);

        // Notify all users in the room about the new user list
        io.to(roomId).emit("allUsers", users);

        // Send join confirmation to the joining user
        socket.emit('user-joined', user);

        // Notify others in the room that a new user joined
        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);

        // Send current whiteboard state to the joining user
        const roomBoard = whiteboardData[roomId] || [];
        socket.emit("whiteboard-update", roomBoard);
    });

    socket.on('message', (data) => {
        const user = getUser(socket.id);
        if (user) {
            socket.broadcast.to(user.id).emit("messageResponse", { message: data.message, name: user.name });
        }
    });

    socket.on("draw-element", (data) => {
        const user = getUser(socket.id);
        if (user && user.presenter) {
            socket.to(user.id).emit("receive-element", data);
        }
    });

    socket.on('whiteboard-update', ({ roomId, elements }) => {
        whiteboardData[roomId] = elements || [];
        socket.to(roomId).emit('whiteboard-update', elements);
    });

    socket.on('whiteboard-clear', ({ roomId }) => {
        whiteboardData[roomId] = [];
        socket.to(roomId).emit('whiteboard-clear');
    });

    socket.on('whiteboard-undo', ({ roomId, elements }) => {
        whiteboardData[roomId] = elements || [];
        socket.to(roomId).emit('whiteboard-update', whiteboardData[roomId]);
    });

    socket.on('whiteboard-redo', ({ roomId, elements }) => {
        whiteboardData[roomId] = elements || [];
        socket.to(roomId).emit('whiteboard-update', whiteboardData[roomId]);
    });

    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        if (user) {
            removeUser(socket.id);
            const usersInRoom = getUsersInRoom(user.id);

            // Delete room and whiteboard data if it becomes empty
            if (usersInRoom.length === 0) {
                activeRooms.delete(user.id);
                delete whiteboardData[user.id];
            } else {
                io.to(user.id).emit("allUsers", usersInRoom);
                socket.broadcast.to(user.id).emit("userLeftMessageBroadcasted", user);
            }
        }
    });

    socket.on("userTyping", (id) => {
        const user = getUser(id);
        if (user) {
            socket.to(user.id).emit("userTyping", user.name);
        }
    });

    socket.on("userStoppedTyping", () => {
        const user = getUser(socket.id);
        if (user) {
            socket.to(user.id).emit("userStoppedTyping");
        }
    });
});

app.get('/', (req, res) => {
    res.send("This is the server for my whiteboard app");
});

const port = process.env.PORT || 5050;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});