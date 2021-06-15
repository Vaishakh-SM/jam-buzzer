import React from 'react';
import socket from "../socket";
import Buzzes from '../Components/Buzzes';
import Buzzer from '../Components/Buzzer';
import Timer from '../Components/Timer';
import PlayerPointsTable from './Player_points';
import { Box, Button, Header, Text, ResponsiveContext } from 'grommet';
import { Home, Group, User } from 'grommet-icons';
import {useHistory} from 'react-router-dom';


const MediumMain = () =>{
    return(
        <Box 
        pad = "small" 
        as = "main"
        direction="row"
        fill>  

            <Box 
            direction = "column" 
            fill = "vertical"
            flex = {{grow : 2}}
            >
                <Box flex={{grow : 1}}>
                    <Timer/>
                </Box>

                <Box 
                flex ={{grow : 2}}
                pad = "medium">
                    <Buzzer/>
                </Box>

            </Box>

            <Box 
            fill = "vertical"
            flex = {{grow : 1}}
            direction = "row">
                
                <Box 
                flex ={{grow : 1}}
                pad = "small">
                    <Buzzes/>
                </Box>

                <Box 
                flex ={{grow : 1}}
                pad = "small">
                    <PlayerPointsTable/>
                </Box>

            </Box>
        </Box>
        );
}

const SmallMain = () => {

    return(
        <Box 
        pad = "small" 
        as = "main"
        direction="column"
        fill
        >
            <Box 
            pad = "small"
            flex = {{grow:2}}
            >
                <Timer/>
            </Box>

            <Box 
            pad = "small"
            flex = {{grow:1}}
            fill = "false"
            >
                <Buzzer/>
            </Box>

            <Box 
            pad = "small"
            flex = {{grow:1}}
            >
                <Buzzes/>
            </Box>

            <Box
            pad = "small"
            flex = {{grow:1}}
            >
                <PlayerPointsTable/>
            </Box>

        </Box>
    )
}
export default function PlayerGame()
{

    let history = useHistory();
    const screenSize = React.useContext(ResponsiveContext);

    function spacebarBuzz(event){
        if(event.key === " ")
            socket.emit('buzz');
    }

    return(
        <Box tabIndex="0" 
        onKeyUp={spacebarBuzz} 
        fill>
            <Header 
            border = {{side : "bottom"}}
            pad = "small">
                    <Button icon={<Home/>} hoverIndicator onClick = {() => {
                        history.push("/")
                    }}/>
                    
                    <Box flex = "grow"></Box>
                    <Box direction = "column">
                        <User/>
                        <Text 
                        alignSelf="center">
                        {socket.nickname}
                        </Text>
                    </Box>
                    <Box direction = "column">
                        <Group/>
                        <Text 
                        alignSelf="center">
                        {socket.roomId}
                        </Text>
                    </Box>
            </Header>
            
            {screenSize === 'small' && <SmallMain/>}
            {screenSize !== 'small' && <MediumMain/>}
            
            
        </Box>
    );
}