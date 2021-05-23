import React, { useEffect, useState } from 'react'
import socket, {hostLogin, recoverSession} from "../socket"

export default function Host()
{
    const [roomId, setRoomId] = useState('Loading')
  
    useEffect(()=>{   
        if(!sessionStorage.uniqueId)
        {
            hostLogin(setRoomId)
        }else{
          let restoreSession = window.confirm('An old session has been found, would you like to reload that session')

          if(restoreSession)
          {
            recoverSession(([setRoomId,roomId])=>{
              setRoomId(roomId)
            },setRoomId,sessionStorage.getItem('roomId'))
    
          }else
          {
            hostLogin(setRoomId)
          }
        }
        
        return () => socket.disconnect()
    },[])
    
    return(
        <div>
            <h1>Room number: {roomId}</h1>
        </div>
    )
}