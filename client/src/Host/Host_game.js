import React, { useEffect, useState } from 'react'
import socket, {hostLogin, hostRecoverSession} from "../socket"
import HostPointsTable from './Host_points';
import Buzzes from '../Components/Buzzes';
import Timer from '../Components/Timer';

function clearBuzzers()
{
  socket.emit('clear-buzzers-all');
}

export default function Host()
{
    const [roomId, setRoomId] = useState('Loading');

    useEffect(()=>{   

        if(!sessionStorage.uniqueId)
        {
            hostLogin(setRoomId)
        }else{
          let restoreSession = window.confirm('An old session has been found, would you like to reload that session')

          if(restoreSession)
          {
            hostRecoverSession(([setRoomId,roomId])=>{
              setRoomId(roomId)
            },setRoomId,sessionStorage.getItem('roomId'))
    
          }else
          {
            hostLogin(setRoomId)
          }
        }
        
    },[])

    return(
        <div>
            <h1>Room number: {roomId}</h1>
            <button onClick ={clearBuzzers}>Clear Buzzers</button>
            <button onClick = {()=>{socket.emit('start-timer-all')}}>
              Start timer
            </button>
            <button onClick = {()=>{socket.emit('stop-timer-all')}}>
              Stop timer
            </button>
            <Timer/>
            <Buzzes/>
            <HostPointsTable/>
        </div>
    )
}