import React, { useEffect, useMemo, useState } from 'react';
import socket, {hostLogin, hostRecoverSession} from '../socket';
import HostPointsTable from './Host_points';
import Buzzes from '../Components/Buzzes';
import Timer from '../Components/Timer';
import { Box, Button, CheckBox, Header, Text, Tab, Tabs, TextInput, FormField, Form, Layer } from 'grommet';
import { Home, Copy, Refresh } from 'grommet-icons';
import { useHistory } from 'react-router-dom';

const ControlPanel = ({settings}) =>{

  const [showSideBar, setShowSideBar] = useState(true);
  const [pointsFormValue, setPointsFormValue] = useState({weightTime: 0});
  const [timerIsHidden, setTimerIsHidden] = useState(false);

  return (
       <Box>
          <Button label = "Settings" onClick = {() =>{
            setTimeout(() => {setShowSideBar(!showSideBar)}, 100);
            }}/>

             {showSideBar && (
               <Box 
               flex = {{grow : 1}}
               animation = "fadeIn"
               pad = "small"
               > 
                 <Tabs>
                   <Tab title = "Time">
                  <Form onSubmit={({ value }) => {socket.emit('set-time',value.timeRemaining)}}>
                    <FormField 
                    name="setTime" 
                    htmlFor="textinput-id" 
                    label="Set Time"
                    info = "(in milliseconds)">
                      <TextInput id="textinput-id" name="timeRemaining" />
                    </FormField>
                      <Button type="submit" secondary label="Submit" />
                  </Form>

                    <CheckBox
                        checked={timerIsHidden}
                        label="Hide timers"
                        onChange={(event) =>{
                           setTimerIsHidden(!timerIsHidden);
                           socket.emit('hide-timers', event.target.checked)
                          }}
                        pad = "small"
                      />

                   </Tab>

                   <Tab title = "Points">
                    <Box direction ="column">
                      <Form
                      value ={pointsFormValue}
                      onChange = {(newValue) => setPointsFormValue(newValue)}
                      onSubmit = {({value}) => {
                        console.log(value);
                        socket.emit('set-weight-time',value.weightTime)
                        }}>
                        <FormField 
                        name="weightTime" 
                        htmlFor="text-input-id" 
                        label="Weight time"
                        info = "Time (in milli) after which speaker starts getting points"
                        flex = "grow">
                          <TextInput id="text-input-id-1" name="weightTime" />
                        </FormField>

                        <Button type="submit" secondary label="Set" />
                     
                      </Form>
                    </Box>
                   </Tab>

                   <Tab title = "Preferences">
                    <CheckBox
                        checked={settings.clearBuzzerOnStart[0]}
                        label="Clear buzzers automatically on starting timer"
                        onChange={(event) => settings.clearBuzzerOnStart[1](event.target.checked)}
                        pad = "small"
                      />
                   </Tab>

                 </Tabs>
               </Box>
             )}

        </Box>
  )
}

const BodyTimer = ({settings}) =>{
  return(
    <Box 
    direction ="row"
    gap = "medium">

      <Box flex = "grow">
        <Timer/>
      </Box>

      <Box 
      direction="column"
      gap ="medium"
      justify = "center">
        <Button primary label = "Start Timer" onClick = {()=>{
          if(settings.clearBuzzerOnStart[0] === true){
            socket.emit('start-timer-all');
            socket.emit('clear-buzzers-all');
          }else{
            socket.emit('start-timer-all');
          }

          }}/>
        <Button secondary label = "Stop Timer" onClick = {()=>{socket.emit('stop-timer-all')}}/>
      </Box>

    </Box>
  );
}

const BodyBuzzes = () =>{
  return(
    <Box 
    direction = "column"
    gap = "medium">
      <Buzzes/>
      <Button primary onClick ={() => socket.emit('clear-buzzers-all')} label = "Clear buzzers"/>
    </Box>
  )
}

const BodyPointsTable = () =>{
  return (
        <HostPointsTable/>
  )
}

export default function Host()
{
    const [roomId, setRoomId] = useState('Loading');
    const [clearBuzzerOnStart, setClearBuzzerOnStart] = useState(true);
    const [showResetLayer, setShowResetLayer] = useState(false);

    const history = useHistory();

    const settings = useMemo(()=>{
      return {
        'clearBuzzerOnStart' : [clearBuzzerOnStart, setClearBuzzerOnStart]
      }
    },[clearBuzzerOnStart]);

    useEffect(()=>{   

        if(!sessionStorage.uniqueId)
        {
            hostLogin(setRoomId)
        }else{
          let restoreSession = window.confirm('An old session has been found, would you like to reload that session')

          if(restoreSession)
          {
            hostRecoverSession(([setRoomId,roomId])=>{
              setRoomId(roomId)
            },setRoomId,sessionStorage.getItem('roomId'))
    
          }else
          {
            hostLogin(setRoomId)
          }
        }
        
    },[])

    return(
        <Box 
        fill = "vertical">
          <Header 
            border = {{side : "bottom"}}
            pad = "small">
                <Button icon={<Home/>} hoverIndicator onClick = {() => {
                    history.push("/")
                }}/>
                
                <Button icon={<Refresh/>} hoverIndicator onClick = {() => {
                    setShowResetLayer(true);
                }}/>

                <Box flex = "grow"></Box>
                <Box direction = "column">
                    <Text>Room ID</Text>
                    <Box direction ="row">
                      <Text 
                      alignSelf="center">
                        {roomId}
                      </Text>
                      <Button icon = {<Copy size ="small"/>} hoverIndicator onClick = {() =>{
                        navigator.clipboard.writeText(roomId);
                      }}/>
                    </Box>
                </Box>
          </Header>
          {showResetLayer && (
            <Layer onEsc={() => setShowResetLayer(false)}
            onClickOutside={() => setShowResetLayer(false)}
            background ={{color: "dark-2"}}
            >
              <Box 
              pad = "medium"
              gap = "small">
                <Text size = "large">Are you sure you want to reset the game?</Text>
                <Box 
                direction = "row"
                gap = "small">
                  <Button label = "Yes" onClick = {()=>{
                    setShowResetLayer(false);
                    socket.emit('reset-game');
                  }}/>
                  <Button label = "No" onClick = {()=>{
                    setShowResetLayer(false);
                  }}/>
                </Box>
              </Box>

            </Layer>
          )}
          <Box 
          direction = "row"
          flex = "grow"
          as = "main"
          fill = {true}
          pad = "small"
          >  

            <Box 
            direction = "column"
            gap = "medium"
            flex = {{grow : 2}}
            >
              <BodyTimer settings = {settings}/>
              <BodyPointsTable/>
            </Box>

            <Box flex = {{grow : 1}}></Box>

            <Box 
            flex = {{grow : 1}}
            direction = "column"
            gap = "medium">
              <BodyBuzzes/>
              <ControlPanel settings = {settings}/>
            </Box>

          </Box>  

        </Box>
    )
}