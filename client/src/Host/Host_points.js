import React, {useState} from 'react'
import {hostPointUpdates} from "../socket";
import { HostPointsToList } from '../Components/To_list';
import socket from "../socket";

let selectedPerson = 'NA'
function onSelect(event){
    let elem = event.target;
    let children = elem.parentNode.children;

    for(let index = 0; index < children.length; index++){
        console.log("item is ",children[index]);
        children[index].style.color = 'black';
    }
    elem.style.color = 'red';
    
    selectedPerson = elem.getAttribute('value');
}

function selectSpeaker(event){
    socket.emit('set-speaker', selectedPerson);
}

export default function HostPointsTable()
{
    const [pointsMap, setPointsMap] = useState(new Map());
    const [currentSpeaker, setCurrentSpeaker] = useState('NA');
    hostPointUpdates(setPointsMap, setCurrentSpeaker);

    return(
        <div>
            <h1>Current speaker : {currentSpeaker}</h1>
            <HostPointsToList map = {pointsMap} onClick = {onSelect}/>
            <button onClick ={selectSpeaker}>Set as speaker</button>
        </div>
    );
}