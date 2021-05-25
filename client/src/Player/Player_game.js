import React , {useState} from 'react';
import socket, {playerListenForUpdates} from "../socket";
import {ArrayToList} from "../Components/toList";

function Buzzer(props)
{
    if(props.buzzerLock === true)
    {
        return(
            <h1>Buzzed</h1>
        )
    }else{
        return(
            <h1>Buzz</h1>
        )
    }
}

export default function PlayerGame()
{
    const [buzzerLock, setBuzzerLock] = useState(false);
    const [buzzes, setBuzzes] = useState([]);

    function buzzHandler(event)
    {
        event.preventDefault();
        
        if(buzzerLock === false)
        {
            socket.emit('buzz');
        }
    }

    playerListenForUpdates(setBuzzes, setBuzzerLock)

    return(
        <div>
            <h1>Room {socket.roomId}</h1>

            <div onClick={buzzHandler}>
                <Buzzer buzzerLock = {buzzerLock}/>
            </div>

            <ArrayToList array = {buzzes}/>
        </div>
    )
}