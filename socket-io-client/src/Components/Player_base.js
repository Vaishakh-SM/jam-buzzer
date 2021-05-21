import React, { useState, useEffect } from 'react'
import PlayerGame from "./Player_game"
import socket from "../socket"

function Login(props)
{
    return(
        <div>
            <h1>Login</h1>
            <form onSubmit = {props.submitHandler}>
                <label>
                    Nickname
                    <input type = "text" id="nickname-input" name = "nickname" placeholder = "Enter Nickname" required/>
                </label>

                <label>
                    Room
                    <input type = "text" id = "room-input" name = "room" placeholder = "Enter Nickname" required/>
                </label>
                <button type = "submit">Submit</button>
            </form>
        </div>
    )
}

export default function PlayerBase()
{
    const [loginStatus, setLoginStatus] = useState(false)
    const [gameState, setGameState] = useState('running')

    function submitHandler(event)
    {
        event.preventDefault();
        const nickname = document.getElementById('nickname-input').value
        const roomId = document.getElementById('room-input').value
        socket.nickname = nickname
        socket.roomId = roomId

        socket.emit('login', roomId)
        setLoginStatus(true)
    }

    useEffect(() => {

    },[gameState])

    if(loginStatus === false)
    {    
        return(
            <Login submitHandler = {submitHandler}/>
        )

    }else {
        return(
            <PlayerGame socket = {socket} 
            gameState = {gameState} 
            setGameState = {setGameState}/>
        )
    }
}