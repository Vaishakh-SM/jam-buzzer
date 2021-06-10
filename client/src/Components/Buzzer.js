import React, {useEffect, useState} from "react";
import socket, {buzzerUpdates } from "../socket";

function BuzzerDisplay(props){
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

export default function Buzzer(){
    const [buzzerLock, setBuzzerLock] = useState(false);
    
    useEffect(()=>{
        buzzerUpdates(setBuzzerLock);
    },[]);
    

    function buzzHandler(event)
    {
        event.preventDefault();
        
        if(buzzerLock === false)
        {
            socket.emit('buzz');
        }
    }

    return(
        <div onClick = {buzzHandler}>
            <BuzzerDisplay buzzerLock = {buzzerLock}/>
        </div>
    )

}