import { Box, Heading } from 'grommet';
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
            <Heading 
            size = "xsmall"
            textAlign = "center"
            margin = "none">Buzzes</Heading>
            <ArrayToList array = {buzzes}/>
        </Box>
    )
}