const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { addUser, getUser, removeUser } = require("./utils/user");

const app = express();
const server = http.createServer(app);

// ✅ Enable CORS for cross-origin access (important for Render + Vercel setup)
app.use(cors({
    origin: "https://colaborate-whiteboard-webapp-v1kp.vercel.app",
    methods: ["GET", "POST"]
}));

// ✅ Setup Socket.IO with CORS config
const io = new Server(server, {
    cors: {
        origin: "https://colaborate-whiteboard-webapp-v1kp.vercel.app", // <-- replace with Vercel frontend URL
        methods: ["GET", "POST"]
    }
});


let roomIdGlobal;

io.on("connection", (socket) => {
    socket.on("update-draw-permission", ({ roomId, targetUserId, canDraw }) => {
        const targetUser = getUsersInRoom(roomId).find(user => user.userId === targetUserId);
        if (targetUser) {
            targetUser.presenter = canDraw;
            const updatedUsers = getUsersInRoom(roomId);
            io.to(roomId).emit("allUsers", updatedUsers); // Broadcast updated user list
        }
    });

    socket.on('user-joined', (userData) => {
        const { name, id, userId, host } = userData;
        const presenter = host ? true : false;
        roomIdGlobal = id;
        socket.join(id);

        const user = {
            name,
            id,
            userId,
            host,
            presenter,
            socketId: socket.id,
            canDraw: host ? true : false
        };

        const users = addUser(user); // Returns updated users array

        io.to(id).emit("allUsers", users);
        socket.emit('user-joined', {
            name: user.name,
            id: user.id,
            userId: user.userId,
            host: user.host,
            presenter: user.presenter
        });
        socket.broadcast.to(id).emit("userJoinedMessageBroadcasted", name);
    });

    socket.on('message', (data) => {
        const { message } = data;
        const user = getUser(socket.id);
        if (user) {
            socket.broadcast.to(roomIdGlobal).emit("messageResponse", { message, name: user.name });
        }
    });

    socket.on("draw-element", (data) => {
        const user = getUser(socket.id);
        if (user && user.presenter) {
            socket.broadcast.to(user.id).emit("receive-element", data);
        }
    });

    socket.on("update-draw-permission", ({ targetUserId, canDraw }) => {
        const user = getUser(socket.id);
        if (!user || !user.host) return;

        const updatedUsers = updateUserPermission(roomIdGlobal, targetUserId, canDraw);
        io.to(roomIdGlobal).emit("allUsers", updatedUsers);
    });

    socket.on("disconnect", () => {
        const user = getUser(socket.id);
        if (user) {
            const users = removeUser(socket.id);
        }
        socket.broadcast.to(roomIdGlobal).emit("userLeftMessageBroadcasted", user);
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

// ✅ Simple route to check server is running
app.get('/', (req, res) => {
    res.send("This is the server for my whiteboard app");
});

// ✅ Use dynamic port for Render deployment
const port = process.env.PORT || 5050;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
