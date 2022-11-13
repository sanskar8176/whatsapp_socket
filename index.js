import { Server } from 'socket.io';

// type module package.json me likhne pr hi es6 ko identify krta hai 

const FRONTEND_URL =  'https://whatsapp-s2ai.onrender.com/'||'http://localhost:3000'

// socket.io as a server work krega do client ke bich
const io = new Server(9000, {
    cors: {
        origin: FRONTEND_URL,  // ess origin se data ayega to  cors allow krega
    }, 
})

// client side me socket.io-client install krna hota h jisse req bheji ja ske
let users = [];

const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) && users.push({ userId, socketId });
}
// users me se ek ek user nikal kr check kiya 

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId);
}

const getUser = (userId) => {
    return users.find(user => user.userId === userId);
}

// used to make a connection , takes one argument (socket) har ek user ke liye dedicated connection create hoga 

io.on('connection',  (socket) => {
    console.log('user connected')

    //connect userid conversation se aya acc.gid hai aur socket id socket generate krta hai 
    socket.on("addUser", userId => {
        addUser(userId, socket.id);
        io.emit("getUsers", users);     //emit method used to define custum event 
    })

    //send message    emit bhrjne k liye //on stablize krne k lie
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
        const user = getUser(receiverId);
        io.to(user?.socketId).emit('getMessage', {     //socket id ke through msg jate hai esliye erciever id se socket id nikala
            senderId, text
        })
    })

    //disconnect
    socket.on('disconnect', () => {
        console.log('user disconnected');
        removeUser(socket.id);
        io.emit('getUsers', users);
    })
})