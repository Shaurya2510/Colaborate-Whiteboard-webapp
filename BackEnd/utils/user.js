const users = []

const addUser = ({ name, id, userId, host, presenter, socketId }) => {
    const user = { name, id, userId, host, presenter, socketId }

    users.push(user);
    return users;
}

const removeUser = (id) => {
    const index = users.findIndex(user => user.socketId === id)
    if (index !== -1) {
        console.log("user removed")
        return users.splice(index, 1)[0]
    }
    return users
}

//get user from list
const getUser = (id) => {

    return users.find((user) => user.socketId === id)
}

//get all users from room

const getUsersInRoom = (roomId) => {
    return users.filter(user => user.id === roomId)
}
const updateUserPermission = (roomId, targetUserId, canDraw) => {
    users.forEach((user) => {
        if (user.id === roomId && user.userId === targetUserId) {
            user.presenter = canDraw;
        }
    });
    return getUsersInRoom(roomId);
};

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
    updateUserPermission
};
