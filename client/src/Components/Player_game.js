import React , {useState} from 'react'
import socket, {listenForUpdates} from "../socket"

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
    if(props.gameState === 'paused')
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

export default function PlayerGame(props)
{
    const [gameState, setGameState] = useState('running')
    const [buzzes, setBuzzes] = useState([])

    function buzzHandler(event)
    {
        event.preventDefault();
        
        if(gameState === 'running')
        {
            socket.emit('buzz')
            setGameState('paused')
        }
    }

    listenForUpdates(setBuzzes)

    return(
        <div>
            <h1>Room {socket.roomId}</h1>

            <div onClick={buzzHandler}>
                <Buzzer gameState = {gameState}/>
            </div>

            <ArrayToList array = {buzzes}/>
        </div>
    )
}