import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import './App.css';
import Login from "./Components/Login"
import Player from "./Components/Player"

const ENDPOINT = "http://127.0.0.1:4001";
let socket = socketIOClient(ENDPOINT);

export default function App() {

  const [userStatus, setUserStatus] = useState('')
  const [buzzes, setBuzzes] = useState([])
  const [gameState, setGameState] = useState('running')

  useEffect(() => {
    setUserStatus('new')
    return () => socket.disconnect()

  },[])


  socket.on('buzzed', (username) => {
    setBuzzes(buzzes.concat(username))
  })

  if(userStatus === 'new')
  {
    return (
      <div>
        <Login socket = {socket} setUserStatus = {setUserStatus} />
      </div>
    );
  }
  else if(userStatus === 'player')
  {
    return(
      <Player gameState = {gameState} buzzes = {buzzes} 
      setGameState = {setGameState} socket ={socket} />
    )
  }
  else if(userStatus === 'master')
  {
    return(
      <h1>Work in progress</h1>
    )
  }

  return(
    <h1>Loading</h1>
  )
}