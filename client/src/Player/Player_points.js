import React, {useState, useEffect} from 'react'
import { PlayerPointsToTable } from '../Components/To_list';
import { playerPointUpdates } from '../socket';

export default function PlayerPointsTable()
{
    const [pointsMap, setPointsMap] = useState(new Map());

    useEffect(() =>{
        playerPointUpdates(setPointsMap);
    },[]);

    return(
        <div>
            <PlayerPointsToTable points = {pointsMap}/>
        </div>
    )
}