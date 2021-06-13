import React, { useEffect, useState } from 'react';
import PlayerGame from "./Player_game";
import { playerLogin, playerRecoverSession } from "../socket";
import { Form, FormField, TextInput, Box, Button, Heading, Header } from 'grommet';
import {Home} from 'grommet-icons';
import {useHistory} from 'react-router-dom';

function Login(props)
{
    const [value, setValue] = React.useState({});
    let history = useHistory();
    return(
        <Box>
            <Header border = {{side : "bottom"}}>
                <Button icon={<Home/>} hoverIndicator onClick = {() => {
                    history.push("/")
                }}/>
            </Header>
            <Box fill = "true" pad = "medium">
                <Heading>Login</Heading>
                <Form
                value={value}
                onChange={nextValue => setValue(nextValue)}
                onReset={() => setValue({})}
                onSubmit={({ value }) => {
                    props.submitHandler(value.roomId, value.nickname);
                }}
                >
                <FormField name="nickname" htmlFor="text-input-id" label="Nickname">
                    <TextInput id="nickname" name="nickname" />
                </FormField>

                <FormField name="roomId" htmlFor="text-input-id" label="Room ID">
                    <TextInput id="roomId" name="roomId" />
                </FormField>

                <Box direction="row" gap="medium">
                    <Button type="submit" primary label="Submit" />
                    <Button type="reset" label="Reset" />
                </Box>
                </Form>
            </Box>
        </Box>
    )
}

export default function PlayerBase()
{
    const [loginStatus, setLoginStatus] = useState(false)

    function submitHandler(roomId, nickname)
    {
        playerLogin(roomId, nickname, setLoginStatus)
    }

    useEffect(() =>{
        if(sessionStorage.uniqueId){
            
          let restoreSession = window.confirm('An old session has been found, would you like to reload that session')

          if(restoreSession){
            playerRecoverSession(([setLoginStatus])=>{
                setLoginStatus(true)
            },setLoginStatus)
          }

        }
        
    },[])

    if(loginStatus === false)
    {    
        return(
            <Login submitHandler = {submitHandler}/>
        )

    }else {
        return(
            <PlayerGame/>
        )
    }
}