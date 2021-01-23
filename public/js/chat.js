const socket = io()
//server (emit) -> client (on) --acknowledgement-->server
//client (emit) -> server (on) --acknowledgement-->client


//Elements variable are starting with $

const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector("input")
const $messageFormButton = $messageForm.querySelector("button")
const $sendLocationButton = document.querySelector("#send-location")

const $messages = document.querySelector("#messages")//location of message rendering

//Templates
const messageTemplate = document.querySelector("#message-template").innerHTML
const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll= ()=>{
    //new  message element
    const $newMessage =$messages.lastElementChild

    //height of the  new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible Height
    const visibleHeight =$messages.offsetHeight

    //height of message container
    const containerHeight = $messages.scrollHeight

    //How far i have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight//always scroll to the bottom
    }

}

socket.on("message",(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm:a')
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

socket.on("locationMessage",(message)=>{
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm:a')
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
    
})

socket.on("roomData",({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML = html
})  

$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    
    $messageFormButton.setAttribute("disabled","disabled")
    //disable
    
    const message = e.target.elements.message.value

    socket.emit('send Message',message,(error)=>{
        $messageFormButton.removeAttribute("disabled")
        $messageFormInput.value=""
        $messageFormInput.focus()
        //enable

        if(error){
            return console.log(error)
        }
        console.log("Message was delivered !")
    })

})


$sendLocationButton.addEventListener("click",()=>{
    
    if(!navigator.geolocation){
        return alert("Geolocation not supported by your browser")
    }
    $sendLocationButton.setAttribute("disabled","disabled")
    //disable
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit("sendLocation",{
            latitude:position.coords.latitude, 
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute("disabled")
            //enabled
            console.log("location was shared!")
           
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})
