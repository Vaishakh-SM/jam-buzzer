import { Box, Heading } from "grommet";
import React, {useEffect, useState} from "react";
import socket, {buzzerUpdates } from "../socket";
import buzzer_sound from "../Sounds/buzzer_sound.mp3";

const BUZZER_SOUND = new Audio(buzzer_sound);

export default function Buzzer(){
    const [buzzerLock, setBuzzerLock] = useState(false);
    const [playBuzzer, setPlayBuzzer] = useState(false);

    useEffect(()=>{
        buzzerUpdates(setBuzzerLock, setPlayBuzzer);
    },[]);

    useEffect(()=>{
        if(playBuzzer === true){
            BUZZER_SOUND.play();
            setPlayBuzzer(false);
        }
    },[playBuzzer])

    function buzzHandler(event)
    {
        event.preventDefault();
        if(buzzerLock === false)
        {
            socket.emit('buzz');
        }
    }

    if(buzzerLock === true)
    {
        return(
            <Box 
            background ={{color:'status-error'}} 
            onClick ={buzzHandler}
            pad = "medium"
            align = "center"
            justify = "center"
            round ={{
                size: "large",
            }}
            fill = "true"
            border={false}
            focusIndicator={false}
            animation="fadeIn">
                <Heading size = "small">Buzzed</Heading>
            </Box>
        )
    }else{
        return(
            <Box background ={{color:'status-ok'}} 
            hoverIndicator = {{color : 'neutral-1'}}
            onClick ={buzzHandler}
            pad = "medium"
            align = "center"
            justify = "center"
            round ={{
                size: "large",
            }}
            fill = "true"
            border={false}
            focusIndicator={false}
            animation="fadeIn">
                <Heading size = "small">Buzz</Heading>
            </Box>
            
        )
    }

}