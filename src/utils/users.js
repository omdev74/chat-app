const users = []

//addUser,removeUser,getUser,getUserInRoom

const addUser = ({id,username,room})=>{
    //Clear the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //validate data
    if(!username || !room){
        return {
            error:"Username and room are required"
        }
    }
    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //validate user name
    if(existingUser){
        return{
            error:"Username in Use"
        }
    }
    //Store User
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{
        return user.id === id
    })
    if(index !== -1){
        //we found a match
        return users.splice(index,1)[0]
    }
}

const getUser = (id)=>{
    return users.find((user)=>user.id === id)
}

const getUserInRoom =(room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}

module.exports={
    addUser,getUser,getUserInRoom,removeUser
}