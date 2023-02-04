const chalk = require('chalk');
const User = require('../models/User');

let users = [];

const addUser = (userId, socketId) => {
    users.push({ userId, socketId });
    console.log(`User ${chalk.green('connected')} : ${chalk.blue(socketId)}`);
}

const removeUser = (socketId) => {
    users = users.filter(u => u.socketId !== socketId);
    console.log(`User ${chalk.red('disconnected')} : ${chalk.blue(socketId)}`);
}

const getSocketId = (userId) => {
    const tempUser = users.find(u => u.userId === userId);
    if (!tempUser) return null;
    return tempUser.socketId;
}

const getUserId = (socketId) => {
    const tempUser = users.find(u => u.socketId === socketId);
    if (!tempUser) return null;
    return tempUser.userId;
}

const socketEventsHandler = (io) => {
    io.on("connection", (socket) => {
        socket.on('addUser', async(userId) => {
            addUser(userId, socket.id);
            
            try {
                const user = await User.findById(userId);
                if (!user) throw new Error("SocketError: Connection: No such user found");
                
                for (let f of user.followers){
                    const socketId = getSocketId(f);
                    if (socketId) io.to(socketId).emit('friendOnline', userId);
                }
            } catch (err) {
                console.log(err);
            }
        })
      
        socket.on('logout', async() => {
            const userId = getUserId(socket.id);

            try {
                const user = await User.findById(userId);
                if (!user) throw new Error("SocketError: Logout: No such user found");

                user.followers.forEach(f => {
                    const socketId = getSocketId(f);
                    if (socketId) io.to(socketId).emit('friendOffline', user._id);
                })
            } catch (err) {
                console.log(err);
            }
            removeUser(socket.id);
        })

        socket.on('disconnect', async() => {
            const userSocketId = socket.id;
            removeUser(socket.id);
            try {
                const userId = getUserId(userSocketId);
                const user = await User.findById(userId);
                if (!user) throw new Error("SocketError: Disconnect: No such user found");

                user.followers.forEach(f => {
                    const socketId = getSocketId(f);
                    if (socketId) io.to(socketId).emit('friendOffline', user._id);
                })
            } catch (err) {
                console.log(err);
            }
        })
        
        socket.on("meOnline", async(userId) => {
            try {
                const friendSocketId = getSocketId(userId);
                console.log(friendSocketId, " is online");
                if (friendSocketId) io.to(friendSocketId).emit('alreadyOnline', userId);
            } catch (err) {
                console.log(err);
            }
        })
        
        socket.on('getOnlineFriends', async(userId) => {
            try {
                const user = await User.findById(userId);
                if (!user) throw new Error("SocketError: getOnlineFriends: No such user found");

                const tempOnlineFriends = [];
                user.followings.forEach(f => {
                    const socketId = getSocketId(f);
                    if (socketId) tempOnlineFriends.push(f);
                })
                const onlineFriends = await User.find({ _id: { $in : tempOnlineFriends } });
                const userSocketId = getSocketId(userId);
                io.to(userSocketId).emit('updateOnlineFriends', onlineFriends);
            } catch (err) {
                console.log(err);
            }
        })
    })
    
}

module.exports = socketEventsHandler;