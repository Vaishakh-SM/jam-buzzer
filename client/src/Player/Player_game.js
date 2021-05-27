import React  from 'react';
import socket from "../socket";
import Buzzes from '../Components/Buzzes';
import Buzzer from '../Components/Buzzer';

export default function PlayerGame()
{
    return(
        <div>
            <h1>Room {socket.roomId}</h1>
            <Buzzer/>
            <Buzzes/>
        </div>
    )
}