import React, { useEffect, useMemo, useState } from 'react';
import socket, {hostLogin, hostRecoverSession} from '../socket';
import HostPointsTable from './Host_points';
import Buzzes from '../Components/Buzzes';
import Timer from '../Components/Timer';
import { Box, Button, CheckBox, Text, Tab, Tabs, TextInput, FormField, Form, Layer, Sidebar } from 'grommet';
import { Home, Copy, Refresh, Play, Stop, FormRefresh, Configure } from 'grommet-icons';
import { useHistory } from 'react-router-dom';
import Swal from 'sweetalert2'

const ControlPanel = ({settings}) =>{

  const [showSideBar, setShowSideBar] = useState(false);
  const [pointsFormValue, setPointsFormValue] = useState({weightTime: 0});
  const [timerIsHidden, setTimerIsHidden] = useState(false);

  return (
       <Box>
          <Box
          pad = "medium"
          justify = "center"
          direction = "row"
          hoverIndicator
          onClick = {() =>{
            setTimeout(() => {setShowSideBar(!showSideBar)}, 100);
            }}>
              <Configure/>
            </Box>

             {showSideBar && (
               <Layer
               onEsc = {()=> setShowSideBar(false)}
               onClickOutside = {() => setShowSideBar(false)}
               background ={{color : "dark-2"}}> 
                <Box
                pad = "medium"
                width = "large"
                height = "medium">
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
               </Layer>
             )}

        </Box>
  )
}

const BodyTimer = ({settings}) =>{
  return(
    <Box 
    direction ="row"
    border ={true}>

      <Box 
      flex= "grow"
      direction="row">
        <Box flex = "grow">
          <Timer/>
        </Box>
     
        <Box 
        direction="row"
        gap ="small"
        justify = "center">
          <Button icon = {<Play/>} hoverIndicator onClick = {()=>{
            if(settings.clearBuzzerOnStart[0] === true){
              socket.emit('start-timer-all');
              socket.emit('clear-buzzers-all');
            }else{
              socket.emit('start-timer-all');
            }

            }}/>
          <Button icon = {<Stop/>} hoverIndicator onClick = {()=>{socket.emit('stop-timer-all')}}/>
          <Button icon = {<FormRefresh/>} hoverIndicator onClick ={() =>{
            let refreshConfirm = window.confirm('Do you wish to set timer to 60 seconds?');
            if(refreshConfirm){
              socket.emit('set-time',60000);
            }
          }}/>
        </Box>
      </Box>

    </Box>
  );
}

const BodyBuzzes = () =>{
  return(
    <Box 
    direction = "column"
    gap = "medium">
      <Box 
      border = {{color : "brand"}}
      pad = "small"
      alignSelf = "center"
      hoverIndicator
      onClick ={() => socket.emit('clear-buzzers-all')}>Clear buzzers</Box>
      <Buzzes/>
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

        if(!sessionStorage.uniqueId || sessionStorage.isHost === "false")
        {
            hostLogin(setRoomId)
        }else{

          Swal.fire({
            title: 'Do you want to recover your old session?',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes!'
          }).then((result) => {
            if (result.isConfirmed) {
              hostRecoverSession(([setRoomId,roomId])=>{
                setRoomId(roomId)
              },setRoomId,sessionStorage.getItem('roomId'))
            }
            else{
              hostLogin(setRoomId)
            }
          })
        }
        
    },[])

    return(
        <Box 
        direction = "row"
        fill = "vertical">
          <Sidebar
            pad = "small"
            flex = "shrink"
            gap = "xlarge"
            background ={{color: "brand"}}>
                    <Box 
                    direction ="column"
                    >
                      <Text 
                      alignSelf="center"
                      >
                        Room Id
                      </Text>

                      <Text 
                      weight = "bold"
                      alignSelf = "center">
                        {roomId}
                      </Text>

                      <Box
                      hoverIndicator 
                      pad = "small"
                      direction = "row"
                      justify = "around"
                      margin ={{top :"xsmall"}}
                      gap = "xsmall"
                      onClick = {() =>{
                        navigator.clipboard.writeText(roomId);
                      }}>
                        <Copy size = "medium"/>
                        <Text>Copy ID</Text>
                      </Box>
                    </Box>
                    
                <Box
                gap = "medium"
                margin = {{vertical: "large"}}>
                  <Box
                  hoverIndicator
                  pad = "medium"
                  justify = "center"
                  direction = "row"
                  onClick = {() => {
                      history.push("/")
                  }}>
                    <Home/>
                  </Box>
                  
                  <Box
                  pad = "medium"
                  justify = "center"
                  direction = "row"
                  hoverIndicator 
                  onClick = {() => {
                      setShowResetLayer(true);
                  }}>
                    <Refresh/>
                  </Box>

                  <ControlPanel settings = {settings}/>
                </Box>
          </Sidebar>
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
                  <Button primary label = "Yes" onClick = {()=>{
                    setShowResetLayer(false);
                    socket.emit('reset-game');
                  }}/>
                  <Button secondary label = "No" onClick = {()=>{
                    setShowResetLayer(false);
                  }}/>
                </Box>
              </Box>

            </Layer>
          )}
          <Box 
          direction = "row"
          flex = {{grow : 5}}
          as = "main"
          pad = "small"
          >  
            <Box 
            direction ="column"
            fill>
              <Box pad = "medium">
                <BodyTimer settings = {settings}/>
              </Box>

              <Box 
              pad = "medium"
              direction ="row"
              justify = "between">
                <Box 
                margin ="small"
                border = "right"
                pad = "medium"
                flex = {{grow:2}}
                fill = "vertical">
                  <BodyPointsTable/>
                </Box>

                <Box 
                margin ="small"
                flex = {{grow:2}}
                pad = "medium">
                  <BodyBuzzes/>
                </Box>

              </Box>

            </Box>

          </Box>  

        </Box>
    )
}