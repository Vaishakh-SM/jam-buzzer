import React  from 'react';
import socket from "../socket";
import Buzzes from '../Components/Buzzes';
import Buzzer from '../Components/Buzzer';
import Timer from '../Components/Timer';
import PlayerPointsTable from './Player_points';

export default function PlayerGame()
{
    return(
        <div>
            <h1>Room {socket.roomId}</h1>
            <h1>Name: {socket.nickname}</h1>
            <Timer/>
            <Buzzer/>
            <Buzzes/>
            <PlayerPointsTable/>
        </div>
    )
}