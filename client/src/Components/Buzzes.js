import { Box, Text } from 'grommet';
import React, {useEffect, useState} from 'react'
import {buzzesUpdates} from '../socket';
import {ArrayToList} from "./To_list";

export default function Buzzes(){
    const [buzzes, setBuzzes] = useState([]);

    useEffect(()=>{
        buzzesUpdates(setBuzzes);
    },[]);
    
    return(
        <Box>
            <Text weight="bold">Buzzes</Text>
            <ArrayToList array = {buzzes}/>
        </Box>
    )
}