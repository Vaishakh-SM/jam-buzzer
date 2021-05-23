import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:4001";
let socket = socketIOClient(ENDPOINT);
console.log(socket)

export function hostLogin(setRoomId)
{
    socket.nickname = "host" 
    socket.emit("host-login")
    socket.on('host-login-success', (roomId, uniqueId) =>{

        sessionStorage.setItem('nickname','host')
        sessionStorage.setItem('roomId', roomId)
        sessionStorage.setItem('uniqueId', uniqueId)

        socket.roomId = roomId
        socket.uniqueId = uniqueId

        setRoomId(socket.roomId)
    })
}

export function playerLogin(roomId, nickname, setLoginStatus)
{
    socket.emit('player-login', socket.id, roomId, nickname)
    socket.on('player-login-success',() =>
    {
        sessionStorage.setItem('nickname',socket.nickname)
        sessionStorage.setItem('roomId', socket.roomId)
        sessionStorage.setItem('uniqueId', socket.uniqueId)
        setLoginStatus(true)
    })

    socket.on('player-login-fail',()=>
    {
        alert('The room does not exist or the host has left the room')
    })
}

function listenForBuzz(setter)
{
    socket.on('update-buzzes',(buzzes)=>{
        setter(buzzes)
    })
}

export function listenForUpdates(... setterFunctions)
{
    listenForBuzz(setterFunctions[0])
}

socket.on('setAttribute',(socketId, attributeObject) =>{
    if(socket.id === socketId)
    {
        for(let attributeName in attributeObject)
            socket[attributeName] = attributeObject[attributeName]
    }
})


export function recoverSession(onRecover, ...args)
{
    socket.uniqueId = sessionStorage.getItem('uniqueId')
    socket.roomId = sessionStorage.getItem('roomId')
    socket.nickname = sessionStorage.getItem('nickname')
    socket.emit('recover-session', socket.uniqueId, socket.roomId, socket.nickname)
    
    socket.on('recover-session-success',(uniqueId) =>{
        if(socket.uniqueId === uniqueId)
        {
            onRecover(args)
        }
    })
}

export default socket