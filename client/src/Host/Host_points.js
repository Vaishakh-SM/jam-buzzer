import React, {useEffect, useState} from 'react'
import { hostPointUpdates } from "../socket";
import { HostPointsToTable } from '../Components/To_list';
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
    event.preventDefault();
    socket.emit('set-speaker', selectedPerson);
}

export default function HostPointsTable()
{
    const [pointsMap, setPointsMap] = useState(new Map());
    const [currentSpeaker, setCurrentSpeaker] = useState('NA');
    
    useEffect(()=>{
        hostPointUpdates(setPointsMap, setCurrentSpeaker);
    }, []);

    return(
        <div>
            <h1>Current speaker : {currentSpeaker}</h1>
            <HostPointsToTable points = {pointsMap} onClick = {onSelect}/>
            <button onClick ={selectSpeaker}>Set as speaker</button>
        </div>
    );
}

// Make it such that selected person is red or shown as selected on screen.
// This is so that on recovery also we can see, instead of using the manual js script.