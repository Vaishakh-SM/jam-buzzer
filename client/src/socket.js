import socketIOClient from "socket.io-client";
import Swal from 'sweetalert2'

const ENDPOINT = "https://jam-buzzer.herokuapp.com/";
// const ENDPOINT = "http://192.168.43.44:4001";
// Set your network endpoint
if(ENDPOINT === null) console.log("Set your network endpoint in socket.js");

const HOME_PATH = 'https://jam-master.netlify.app/';

let socket = socketIOClient(ENDPOINT);


// Player
export function playerLogin(roomId, nickname, setLoginStatus){
    socket.emit('player-login', socket.id, roomId, nickname);

    socket.on('player-login-success',(uniqueId, roomId, nickname) =>
    {     
        sessionStorage.setItem('uniqueId', uniqueId);
        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('nickname',nickname);
        sessionStorage.setItem('isHost',"false");

        socket.uniqueId = uniqueId;
        socket.roomId = roomId;
        socket.nickname = nickname;

        setLoginStatus(true);
        socket.emit('player-fetch-components');
    });

    socket.on('player-login-fail',()=>
    {
        Swal.fire('The room does not exist or the host has left the room');
    });
}

export function playerRecoverSession(onRecover, ...args){
 
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
        happens when the room you are trying to enter has closed`);

        window.location = HOME_PATH;
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

// HOST
export function hostRecoverSession(onRecover, ...args){
 
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

export function hostLogin(setRoomId){

    socket.nickname = "host" ;
    socket.emit("host-login");
    socket.on('host-login-success', (uniqueId, roomId) =>{

        sessionStorage.setItem('nickname','host');
        sessionStorage.setItem('roomId', roomId);
        sessionStorage.setItem('uniqueId', uniqueId);
        sessionStorage.setItem('isHost',"true");

        socket.roomId = roomId;
        socket.uniqueId = uniqueId;

        setRoomId(socket.roomId);
        socket.emit('host-fetch-components');
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

// Components
export function buzzerUpdates(setBuzzerLock, setPlayBuzzer){

    socket.on('emit-buzzer-sound',()=>{
        setPlayBuzzer(true);
    })

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

export function timerUpdates(setTime,setIsRunning,setIsHidden,setCurrentTimeStamp){

    socket.on('start-timer-all',(timeOffset) =>{
        setIsRunning(true);
        setCurrentTimeStamp(timeOffset);
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

    socket.off('start-timer-failed')
    socket.on('start-timer-failed',(uniqueId)=>{
        if(socket.uniqueId === uniqueId){
            Swal.fire({
                title: 'Please select a speaker',
                width: 600,
                padding: '3em',
                background: '#fff',
                backdrop: `
                  rgba(0,0,123,0.4)
                  url("https://sweetalert2.github.io/images/nyan-cat.gif")
                  left top
                  no-repeat
                `
              })
        }
    })
}

export function buzzesUpdates(setBuzzes){
    socket.on('update-buzzes-all',(buzzes)=>{
        setBuzzes(buzzes);
    });

    socket.on('update-buzzes', (uniqueId, buzzes)=>{
        if(socket.uniqueId === uniqueId)
            setBuzzes(buzzes);
    })
}


socket.on('not-authorised',(uniqueId) =>{
    if(socket.uniqueId === uniqueId){
        Swal.fire('You are not authorised for this action');
    }
})

export default socket;