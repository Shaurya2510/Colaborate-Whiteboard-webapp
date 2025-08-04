const express = require("express")
const app = express()
const { addUser, getUser, removeUser } = require("./utils/user")

const http = require("http")
const { Server } = require("socket.io")

//creating http server for our app
const server = http.createServer(app)

//creating server instance for socket
const io = new Server(server)

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
        const { message } = data
        const user = getUser(socket.id)
        if (user) {
            socket.broadcast.to(roomIdGlobal).emit("messageResponse", { message, name: user.name })
        }
    })

    // ✅ Move this here (inside)
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
            const users = removeUser(socket.id)
        }
        socket.broadcast.to(roomIdGlobal).emit("userLeftMessageBroadcasted", user)
    })
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

//Routes
app.get('/', (req, res) => {
    res.send("this is the server for my whiteboard app")

})

const port = process.env.PORT || 5000

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
})
