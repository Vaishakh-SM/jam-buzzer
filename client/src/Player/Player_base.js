import React, { useEffect, useState } from 'react';
import PlayerGame from "./Player_game";
import { playerLogin, playerRecoverSession } from "../socket";
import { Form, FormField, TextInput, Box, Button, Heading, Header, ResponsiveContext, Text } from 'grommet';
import {Home} from 'grommet-icons';
import {useHistory} from 'react-router-dom';

export default function PlayerBase()
{
    const [loginStatus, setLoginStatus] = useState(false)
    const [canRecover, setCanRecover] = useState(false);
    const [value, setValue] = useState({});

    let history = useHistory();
    const size = React.useContext(ResponsiveContext);

    function submitHandler(roomId, nickname)
    {
        playerLogin(roomId, nickname, setLoginStatus)
    }

    useEffect(() =>{
        if(sessionStorage.uniqueId 
            && sessionStorage.isHost === "false"){
          setCanRecover(true);
        }
        
    },[])

    if(loginStatus === false)
    {    
        return(
            <Box fill="true">
            <Header border = {{side : "bottom"}}>
                <Button icon={<Home/>} hoverIndicator onClick = {() => {
                    history.push("/")
                }}/>
            </Header>
            <Box fill="true" direction={size==="small"?"column":"row"} justify="around" align={size==="small"?"stretch":"center"} pad = "medium">
                
                <Box flex={{shrink: 0}} width={size==="small"?null:"large"} pad={size==="small"?{"horizontal": "small"}:{bottom: "xlarge", horizontal: "medium"}}>
                    <Heading size = "small">Join Game</Heading>
                    <Form
                    value={value}
                    onChange={nextValue => setValue(nextValue)}
                    onReset={() => setValue({})}
                    onSubmit={({ value }) => {
                        submitHandler(value.roomId, value.nickname);
                    }}
                    >
                    <FormField name="nickname" htmlFor="text-input-id" label="Nickname" required>
                        <TextInput id="nickname" name="nickname" />
                    </FormField>

                    <FormField name="roomId" htmlFor="text-input-id" label="Room ID" required>
                        <TextInput id="roomId" name="roomId" />
                    </FormField>

                    <Box 
                    direction={size==="small"?"column":"row"} 
                    gap="medium"
                    margin={{top: "large"}}
                    fill = {"horizontal"}>
                        <Button 
                        type="submit" 
                        size="xlarge"
                        primary 
                        label="Join" />

                        <Button type="reset" size="xlarge" label="Reset" />
                    </Box>
                    </Form>
                </Box>
                {canRecover && (
                    <Box pad="medium" gap="medium">
                        <Text size="large">Recover Session?</Text>
                        <Text size="small">We found a previous session with room number <strong>{sessionStorage.roomId}</strong>. Do you want to join this again? If you do not, this session will be lost.</Text>
                        <Button 
                        margin={{top: "medium"}}
                        label = "Recover"
                        alignSelf={size==="small"?"stretch":"start"}
                        onClick = {() => (
                            playerRecoverSession(([setLoginStatus])=>{
                        setLoginStatus(true)
                        },setLoginStatus))}/>
                    </Box>
                )}
            </Box>
        </Box>
        )

    }else {
        return(
            <PlayerGame/>
        )
    }
}