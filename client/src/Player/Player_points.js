import React, {useState, useEffect} from 'react'
import {fetchPoints} from "../socket";

function PlayerPointsTable()
{
    const [pointsMap, setPointsMap] = useState(new Map());

    useEffect(() =>{
        fetchPoints(setPointsMap);
    },[]);

}