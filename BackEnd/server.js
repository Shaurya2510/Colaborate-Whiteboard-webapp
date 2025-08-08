const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { addUser, getUser, removeUser, getUsersInRoom, updateUserPermission } = require("./utils/user");

const app = express();
const server = http.createServer(app);

// ✅ Allow frontend access (update the domain if needed)
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

// ✅ Track all active room IDs
const activeRooms = new Set();

io.on("connection", (socket) => {
    // ✅ Draw permission updates
    socket.on("update-draw-permission", ({ roomId, targetUserId, canDraw }) => {
        updateUserPermission(roomId, targetUserId, canDraw); // <- new function in utils/user.js

        const updatedUsers = getUsersInRoom(roomId);
        io.to(roomId).emit("users-updated", updatedUsers);

        const targetUser = updatedUsers.find(u => u.userId === targetUserId);
        if (targetUser) {
            io.to(targetUser.socketId).emit("draw-permission-updated", canDraw);
        }
    });


    // ✅ Handle room join/create
    socket.on('user-joined', (userData) => {
        const { name, id: roomId, userId, host } = userData;
        const presenter = host ? true : false;

        // ✅ Room creation (host only)
        if (host) {
            if (activeRooms.has(roomId)) {
                socket.emit('room-exists');
                return;
            }
            activeRooms.add(roomId);
        }

        // ✅ Room join validation
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
            canDraw: host
        };

        const users = addUser(user);

        io.to(roomId).emit("allUsers", users);
        socket.emit('user-joined', {
            name: user.name,
            id: roomId,
            userId: user.userId,
            host: user.host,
            presenter: user.presenter
        });

        socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);
    });

    // ✅ Handle messaging
    socket.on('message', (data) => {
        const { message } = data;
        const user = getUser(socket.id);
        if (user) {
            socket.broadcast.to(user.id).emit("messageResponse", { message, name: user.name });
        }
    });

    // ✅ Handle real-time drawing
    socket.on("draw-element", (data) => {
        const user = getUser(socket.id);
        if (user && user.presenter) {
            socket.broadcast.to(user.id).emit("receive-element", data);
        }
    });




    // ✅ Handle disconnection and cleanup
    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        if (user) {
            const users = removeUser(socket.id);
            const roomUsers = users.filter(u => u.id === user.id);

            // ✅ Delete empty rooms
            if (roomUsers.length === 0) {
                activeRooms.delete(user.id);
            }

            socket.broadcast.to(user.id).emit("userLeftMessageBroadcasted", user);
        }
    });

    // ✅ Typing indicators
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

// ✅ Health check
app.get('/', (req, res) => {
    res.send("This is the server for my whiteboard app");
});

// ✅ Start server
const port = process.env.PORT || 5050;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
