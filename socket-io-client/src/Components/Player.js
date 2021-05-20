import React, { useState } from 'react'
// State: Buzzes, buzzer state.

function ArrayToList(props)
{

    let listItems = props.array.map((item, index) => {
        return (<li key = {index}>{index + 1} : {item}</li>)
    })
   
    return(
        <ul>{listItems}</ul>
    )
}

function Buzzer(props)
{
    if(props.gameState == 'paused')
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

export default function Player(props)
{

    function buzzHandler(event)
    {
        event.preventDefault();
        if(props.gameState == 'running')
        {
            let data = {
                'username': props.socket.username,
                'roomId' : props.socket.roomId
            }

            props.socket.emit('buzz', data)
            
            props.setGameState('paused')
        }
    }

    return(
        <div>
            <h1>Room {props.socket.roomId}</h1>
            <div onClick={buzzHandler}>
                <Buzzer gameState = {props.gameState}/>
            </div>
            <ArrayToList array = {props.buzzes}/>
        </div>
    )
}