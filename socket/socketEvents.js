const chalk = require('chalk');
const User = require('../models/User');
const Console = require('console').Console;
const fs = require('fs');


// For console logging
const stream = fs.createWriteStream('./socket/socketLog.log');
const console = new Console(stream, stream);    // Same stream for both stdout and stderr


let users = [];

const addUser = (userId, socketId) => {
    const user = users.find(u => u.userId === userId);
    if (!user) users.push({ userId, socketId });
    else user.socketId = socketId;
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
                if (friendSocketId) io.to(friendSocketId).emit('alreadyOnline', userId);
            } catch (err) {
                console.log(err);
            }
        })
        
        socket.on('getFriends', async(userId) => {
            try {
                const user = await User.findById(userId);
                if (!user) throw new Error("SocketError: getFriends: No such user found");

                const tempOnlineFriends = [];
                user.followings.forEach(f => {
                    const socketId = getSocketId(f);
                    if (socketId) tempOnlineFriends.push(f);
                })
                const onlineFriends = await User.find({ _id: { $in : tempOnlineFriends } });
                const offlineFriends = await User.find({ $and : [{ _id: { $in : user.followings } },{ _id: { $not: { $in : tempOnlineFriends } } }] });
                const userSocketId = getSocketId(userId);
                io.to(userSocketId).emit('updateFriends', { onlineFriends, offlineFriends });
            } catch (err) {
                console.log(err);
            }
        })
        
        socket.on('sendNewMessage', (msg) => {
            try {
                const recieverSocketId = getSocketId(msg.recieverId);
                if (recieverSocketId) io.to(recieverSocketId).emit('recieveNewMessage', msg);
            } catch (err) {
                console.log(err); 
            }
        })
        
        socket.on('sendNotification' , ({ targetUserId, notification }) => {
            try {
                const recieverSocketId = getSocketId(targetUserId);
                
                if (recieverSocketId) io.to(recieverSocketId).emit('recieveNotification', notification);
            } catch (err) {
                console.log(err);
            }
        })
        
        socket.on('myFollowRequest', ({ friendId, user }) => {
            try {
                const recieverSocketId = getSocketId(friendId);
                if (recieverSocketId) io.to(recieverSocketId).emit('gotFollowRequest', user);
            } catch (err) {
                console.log(err); 
            }
        }) 
        
        socket.on('yourFollowRequestAccepted', ({ friendId, userId }) => {
            try {
                const recieverSocketId = getSocketId(friendId);
                if (recieverSocketId) io.to(recieverSocketId).emit('myFollowRequestAccepted', userId);
            } catch (err) {
                console.log(err); 
            } 
        })
    })
    
}

// setInterval(() => {
//     console.log(chalk.bgBlue('Online users: ') + ' ' + chalk.blue(users.map(u => u.userId)));
// }, 5*1000);

module.exports = socketEventsHandler;