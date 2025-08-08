// server.js
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

// Track active rooms (no whiteboard persistence)
const activeRooms = new Set();

io.on("connection", (socket) => {
    // Update draw permission (host changes user's presenter flag)
    socket.on("update-draw-permission", ({ roomId, targetUserId, canDraw }) => {
        updateUserPermission(roomId, targetUserId, canDraw);

        const updatedUsers = getUsersInRoom(roomId);
        io.to(roomId).emit("users-updated", updatedUsers);

        const targetUser = updatedUsers.find(u => u.userId === targetUserId);
        if (targetUser) {
            io.to(targetUser.socketId).emit("draw-permission-updated", canDraw);
        }
    });

    // Handle room join/create
    socket.on('user-joined', (userData) => {
        const { name, id: roomId, userId, host } = userData;
        const presenter = !!host;

        // Room creation (host only)
        if (host) {
            if (activeRooms.has(roomId)) {
                socket.emit('room-exists');
                return;
            }
            activeRooms.add(roomId);
        }

        // Room join validation
        if (!host && !activeRooms.has(roomId)) {
            socket.emit('room-not-found');
            return;
        }

        socket.join(roomId);

        const user = {
            name,
            id: roomId,
            userId,
            host,
            presenter,
            socketId: socket.id,
            canDraw: !!host
        };

        const users = addUser(user);

        // send full user list to room
        io.to(roomId).emit("allUsers", users);

        // confirm to the joining socket
        socket.emit('user-joined', {
            name: user.name,
            id: roomId,
            userId: user.userId,
            host: user.host,
            presenter: user.presenter
        });

        // notify others in room
        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);

        // NOTE: no persistent whiteboard state is sent — room is fresh
    });

    // Messaging
    socket.on('message', (data) => {
        const { message } = data;
        const user = getUser(socket.id);
        if (user) {
            socket.broadcast.to(user.id).emit("messageResponse", { message, name: user.name });
        }
    });

    // Real-time incremental stroke broadcast
    socket.on("draw-element", ({ roomId, element }) => {
        const user = getUser(socket.id);
        if (user && user.presenter) {
            // broadcast to others in same room
            socket.to(roomId).emit("receive-element", element);
        }
    });

    // Full-state update (undo/redo/explicit full update from client)
    socket.on('whiteboard-update', ({ roomId, elements }) => {
        // no storage — just broadcast to room
        socket.to(roomId).emit('whiteboard-update', elements);
    });

    // Clear whiteboard for a room (no storage)
    socket.on('whiteboard-clear', ({ roomId }) => {
        socket.to(roomId).emit('whiteboard-clear');
    });

    // Optional explicit undo/redo (treated same as full update)
    socket.on('whiteboard-undo', ({ roomId, elements }) => {
        socket.to(roomId).emit('whiteboard-update', elements);
    });

    socket.on('whiteboard-redo', ({ roomId, elements }) => {
        socket.to(roomId).emit('whiteboard-update', elements);
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        if (user) {
            const users = removeUser(socket.id);
            const roomUsers = users.filter(u => u.id === user.id);

            // delete empty rooms (and don't persist anything)
            if (roomUsers.length === 0) {
                activeRooms.delete(user.id);
            }

            socket.broadcast.to(user.id).emit("userLeftMessageBroadcasted", user);
        }
    });

    // Typing indicators
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
