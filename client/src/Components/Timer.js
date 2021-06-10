import React, {useState, useEffect} from 'react'
import {timerUpdates} from "../socket";

const LEAST_COUNT = 100; 
let timeoutId;

function TimeToString(props)
{
    // Takes time in milliseconds and returns 
    // 00:00:000 format, min:sec:milliseconds
   
    let minutes = Math.floor(props.time/(60000)); 
    let seconds = Math.floor( (props.time - minutes * 60000)/(1000));
    let milliseconds = Math.floor((props.time - (minutes * 60000) - (seconds * 1000)));

    if(minutes < 10) minutes = '0' + minutes;
    if(seconds < 10) seconds = '0' + seconds;
    if(milliseconds < 100 && milliseconds > 10) milliseconds = '0' + milliseconds;
    if(milliseconds < 10) milliseconds = '00' + milliseconds;
    
    let finalTime = '' + minutes + ':' + seconds +':' + milliseconds;

    return (
        <h1>
        {finalTime}
        </h1>
    );
}


export default function Timer()
{

  const [time, setTime] = useState(60000);
  const [isRunning, setIsRunning] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect( ()=>{
    timerUpdates(setTime, setIsRunning, setIsHidden);
  },[]);

  useEffect(() => {
   
    if(isRunning === true && time > 0)
    {
        timeoutId = setInterval(setTime,LEAST_COUNT,Math.max(0, time - LEAST_COUNT));
    }

    return () => clearInterval(timeoutId);
  },[time, isRunning]);

  if(isHidden === false)
  {
    return(
        <div>
            <TimeToString time = {time}/>
        </div>
    );

  }else{
    return(
        <div>
            <h1> Hidden </h1>
        </div>
    );
  }
}