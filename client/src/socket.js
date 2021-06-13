import socketIOClient from "socket.io-client";

const ENDPOINT = "http://192.168.1.4:4001";
const HOME_PATH = 'http://localhost:3000';

let socket = socketIOClient(ENDPOINT);


// Player
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
        socket.emit('player-fetch-components');
    });

    socket.on('player-login-fail',()=>
    {
        alert('The room does not exist or the host has left the room');
    });
}

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
            
            onRecover(args);
            socket.emit('player-fetch-components');
        }
    })

    socket.on('player-recover-session-fail',() =>{

        alert(`Recovery failed. This may be due to several reasons, usually
        happens when the room you are trying to enter has closed or if you try to enter as host, while you
        only have player permissions`);

        window.location = HOME_PATH;
    })
}

// HOST
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
            
            onRecover(args);
            socket.emit('host-fetch-components');
        }
    })

    socket.on('host-recover-session-fail',() =>{

        alert(`Recovery failed. This may be due to several reasons, usually
        happens when the room you are trying to enter has closed or trying to enter player room
        while you were host in a previous round`);

        window.location = HOME_PATH;
    })
}

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
        socket.emit('host-fetch-components');
    })
}

// MISC

export function buzzerUpdates(setBuzzerLock){

    socket.on('lock-buzzer',(uniqueId)=>{
        if(socket.uniqueId === uniqueId){
            setBuzzerLock(true);
        }
    })

    socket.on('unlock-buzzer',(uniqueId)=>{
        if(socket.uniqueId === uniqueId){
            setBuzzerLock(false);
        }
    })

    socket.on('unlock-buzzer-all',()=>{
        setBuzzerLock(false);
    })

    socket.on('lock-buzzer-all',()=>{
        setBuzzerLock(true);  
    })
}

export function timerUpdates(setTime,setIsRunning,setIsHidden)
{
    socket.on('start-timer-all',() =>{
        setIsRunning(true);
    })

    socket.on('stop-timer-all', () =>{
        setIsRunning(false);
    })

    socket.on('start-timer',(uniqueId) =>{
        if(socket.uniqueId === uniqueId)
            setIsRunning(true);
    })

    socket.on('stop-timer', (uniqueId) =>{
        if(socket.uniqueId === uniqueId)
            setIsRunning(false);
    })

    socket.on('hide-timer-all', (hostId) =>{
        if(socket.uniqueId !== hostId){
            setIsHidden(true);
        }
    })

    socket.on('unhide-timer-all', ()=>{
        setIsHidden(false);
    })

    socket.on('set-time-all', (time) => {
        setTime(time);
    })

    socket.on('set-time', (uniqueId,time)=>{
        if(socket.uniqueId === uniqueId){
            setTime(time);
        }
    })

    socket.on('start-timer-failed',(uniqueId)=>{
        if(socket.uniqueId === uniqueId){
            alert('Please select a speaker before starting timer');
        }
    })
}

export function buzzesUpdates(setBuzzes){
    socket.on('update-buzzes-all',(buzzes)=>{
        setBuzzes(buzzes);
    });

    socket.on('update-buzzes', (uniqueId, buzzes)=>{
        console.log('Update buzzes called ',' unique id given is ',uniqueId);
        console.log("Socket unique id is ",socket.uniqueId);
        // DEBUG COMMENTS

        if(socket.uniqueId === uniqueId)
            setBuzzes(buzzes);
    })
}

export function hostPointUpdates(setPointsMap, setCurrentSpeaker){
    socket.on('update-points-all', (points) =>{
        setPointsMap(new Map(points));
    })

    socket.on('update-points', (uniqueId,points)=>{
        if(socket.uniqueId === uniqueId)
            setPointsMap(new Map(points));
    })

    socket.on('set-current-speaker', (nickname)=>{
        setCurrentSpeaker(nickname);
    })
}

export function playerPointUpdates(setPointsMap){

    socket.on('update-points-all', (points) =>{
        setPointsMap(new Map (points));
    })

    socket.on('update-points', (uniqueId,points)=>{
        if(socket.uniqueId === uniqueId)
            setPointsMap(new Map(points));
    })
}

socket.on('not-authorised',(uniqueId) =>{
    if(socket.uniqueId === uniqueId){
        alert('You are not authorised for this action');
    }
})

export default socket;