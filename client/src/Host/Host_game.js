import React, { useEffect, useState } from 'react'
import socket, {hostLogin, hostRecoverSession} from "../socket"
import HostPointsTable from './Host_points';
import Buzzes from '../Components/Buzzes';
import Timer from '../Components/Timer';
import { Box, Button, Collapsible, Heading } from 'grommet';

function clearBuzzers()
{
  socket.emit('clear-buzzers-all');
}

export default function Host()
{
    const [roomId, setRoomId] = useState('Loading');
    const [showSideBar, setShowSideBar] = useState(true);

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
        <Box direction = "row">
            <Box 
            flex = {{grow : 1}}
            >
              <h1>Room number: {roomId}</h1>
              
              <Button onClick ={clearBuzzers}>Clear Buzzers</Button>
              <Button onClick = {()=>{socket.emit('start-timer-all')}}>
                Start timer
              </Button>
              <Button onClick = {()=>{socket.emit('stop-timer-all')}}>
                Stop timer
              </Button>
              <Timer/>
              <Buzzes/>
              <HostPointsTable/>
            </Box>  
            <button onClick = {() =>{setShowSideBar(!showSideBar)}}>Toggle</button>
            <Collapsible
            direction = "horizontal"
            open = {showSideBar}>
              <Box 
              flex = {{grow : 1}}
              > 
                <Heading>Lmao</Heading>
              </Box>
            </Collapsible>
        </Box>
    )
}