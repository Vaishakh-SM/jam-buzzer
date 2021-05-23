import React, { useEffect, useState } from 'react'
import PlayerGame from "./Player_game"
import socket, { playerLogin, recoverSession } from "../socket"

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

    function submitHandler(event)
    {
        event.preventDefault();
        const nickname = document.getElementById('nickname-input').value
        const roomId = document.getElementById('room-input').value

        playerLogin(roomId, nickname, setLoginStatus)
    }

    useEffect(() =>{
        if(sessionStorage.uniqueId){
            
          let restoreSession = window.confirm('An old session has been found, would you like to reload that session')

          if(restoreSession){
            recoverSession(([setLoginStatus])=>{
                setLoginStatus(true)
            },setLoginStatus)
          }

        }

        return () => socket.disconnect()
        
    },[])

    if(loginStatus === false)
    {    
        return(
            <Login submitHandler = {submitHandler}/>
        )

    }else {
        return(
            <PlayerGame/>
        )
    }
}