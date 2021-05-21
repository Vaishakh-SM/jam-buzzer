import React, { useEffect, useState } from 'react'
import socket, {createRoom} from "../socket"

export default function Host()
{
    const [roomId, setRoomId] = useState('Loading')
  
    useEffect(()=>{    
        createRoom(setRoomId)
        
        return () => socket.disconnect()
    },[])
    
    return(
        <div>
            <h1>Room number: {roomId}</h1>
        </div>
    )
}