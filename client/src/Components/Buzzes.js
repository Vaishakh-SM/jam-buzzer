import React, {useState} from 'react'
import { buzzesUpdates } from '../socket';
import {ArrayToList} from "./To_list";

export default function Buzzes(){
    const [buzzes, setBuzzes] = useState([]);
    buzzesUpdates(setBuzzes);
    return(
        <ArrayToList array = {buzzes}/>
    )
}