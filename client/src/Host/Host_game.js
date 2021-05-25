import React, { useEffect, useState } from 'react'
import {hostListenForUpdates, hostLogin, hostRecoverSession} from "../socket"
import {ArrayToList} from "../Components/toList";

export default function Host()
{
    const [roomId, setRoomId] = useState('Loading');
    const [buzzes, setBuzzes] = useState([]);

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
    
    hostListenForUpdates(setBuzzes);

    return(
        <div>
            <h1>Room number: {roomId}</h1>
            <ArrayToList array = {buzzes}/>
        </div>
    )
}