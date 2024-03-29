const path = require("path")
const http = require('http')
const socketio = require('socket.io')
const Filter = require("bad-words")
const express = require("express")

const app = express()
const server = http.createServer(app)//by default express does it anyway
const io = socketio(server)//also provides client side js file to serve up

const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname,"../public")
const {generateMessage,generateLocationMessage} = require("../src/utils/messages")
const {getUser,addUser,getUserInRoom,removeUser}=require("./utils/users")

app.use(express.static(publicDirectory))



//server (emit) -> client (on) - Message
//client (emit) -> server (on) - send Message


//listening to connection event
io.on('connection',(socket)=>{
    console.log("New WebSocket Connection ")
    
    socket.on('join',(options,callback)=>{
        
        const{error,user}=addUser({id:socket.id,...options})

        if(error){
            return callback(error)
        }
        socket.join(user.room)

        socket.emit("message",generateMessage("Admin","Welcome!"))
        socket.broadcast.to(user.room).emit("message",generateMessage("Admin",`${user.username} has joined`))

        io.to(user.room).emit("roomData",{
            room:user.room,
            users:getUserInRoom(user.room)
        })

        callback()
    })

    socket.on("send Message",(message,callback)=>{
        
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message))
        {
            return callback("Profanity Not Allowed")
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        
        
        callback()//acknowledgement message
    })

    socket.on("sendLocation",(coords,callback)=>{
        const user = getUser(socket.id)
        console.log(user,"send location") 
        io.to(user.room).emit("locationMessage",generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()

    })

    socket.on("disconnect",()=>{
        
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message",generateMessage("Admin",`${user.username} has left!`))
            io.to(user.room).emit("roomData",{
                room:user.room,
                users:getUserInRoom(user.room)
            })

        }
    
    })

})

server.listen(port,()=>{
    console.log(`app running on port ${port}`)
})


