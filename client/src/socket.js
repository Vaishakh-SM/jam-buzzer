import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:4001";
const HOME_PATH = 'http://localhost:3000';

let socket = socketIOClient(ENDPOINT);

// Session storage roomId and uniqueId initialised but not used

export function hostLogin(setRoomId)
{
    socket.nickname = "host" ;
    socket.emit("host-login");
    socket.on('host-login-success', (uniqueId, roomId) =>{

        sessionStorage.setItem('nickname','host');
        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('uniqueId', uniqueId);

        socket.roomId = roomId;
        socket.uniqueId = uniqueId;

        setRoomId(socket.roomId);
    })
}

export function playerLogin(roomId, nickname, setLoginStatus)
{
    socket.emit('player-login', socket.id, roomId, nickname);

    socket.on('player-login-success',(uniqueId, roomId, nickname) =>
    {     
        sessionStorage.setItem('uniqueId', uniqueId);
        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('nickname',nickname);

        socket.uniqueId = uniqueId;
        socket.roomId = roomId;
        socket.nickname = nickname;

        setLoginStatus(true);
    })

    socket.on('player-login-fail',()=>
    {
        alert('The room does not exist or the host has left the room');
    })
}

function listenForBuzz(setter)
{
    socket.on('update-buzzes',(buzzes)=>{
        setter(buzzes);
    })
}

export function listenForUpdates(...setterFunctions)
{
    listenForBuzz(setterFunctions[0]);
}

socket.on('setAttribute',(socketId, attributeObject) =>{
    if(socket.id === socketId)
    {
        for(let attributeName in attributeObject)
            socket[attributeName] = attributeObject[attributeName];
    }
})


export function playerRecoverSession(onRecover, ...args)
{
 
    socket.emit('player-recover-session', sessionStorage.getItem('uniqueId'));
  
    socket.on('player-recover-session-success',(uniqueId, roomId, nickname) =>{
        
        if(sessionStorage.getItem('uniqueId') === uniqueId)
        {
            socket.uniqueId = uniqueId;
            socket.roomId = roomId;
            socket.nickname = nickname;

            sessionStorage.setItem('roomId', roomId);
            sessionStorage.setItem('nickname',nickname);
            
            onRecover(args)
        }
    })

    socket.on('player-recover-session-fail',() =>{

        alert(`Recovery failed. This may be due to several reasons, usually
        happens when the room you are trying to enter has closed or if you try to enter as host, while you
        only have player permissions`);

        window.location = HOME_PATH;
    })
}

export function hostRecoverSession(onRecover, ...args)
{
 
    socket.emit('host-recover-session', sessionStorage.getItem('uniqueId'));
    
    socket.on('host-recover-session-success',(uniqueId, roomId, nickname) =>{
        
        if(sessionStorage.getItem('uniqueId') === uniqueId)
        {
            socket.uniqueId = uniqueId;
            socket.roomId = roomId;
            socket.nickname = nickname;

            sessionStorage.setItem('roomId', roomId);
            sessionStorage.setItem('nickname',nickname);
            
            onRecover(args)
        }
    })

    socket.on('host-recover-session-fail',() =>{

        alert(`Recovery failed. This may be due to several reasons, usually
        happens when the room you are trying to enter has closed or trying to enter player room
        while you were host in a previous round`);

        window.location = HOME_PATH;
    })
}

export default socket;