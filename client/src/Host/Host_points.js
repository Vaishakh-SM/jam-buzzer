import React, { useEffect, useMemo, useState } from 'react';
import { hostPointUpdates } from '../socket';
import { Box, Button, DataTable, Text, Layer, Form, FormField, TextInput } from 'grommet';
import socket from "../socket";
import {BeautifyName} from "../Components/To_list";
import Swal from 'sweetalert2'

let currentSpeakerId = null;
let selectedParticipantId = null;
let selectedParticipantName = 'NA';

const selectSpeaker = () => {
    currentSpeakerId = selectedParticipantId;
    if(currentSpeakerId !== null){
        socket.emit('set-speaker', currentSpeakerId);
    }else{
        Swal.fire({
            title: 'Please select a speaker (click on the points table dummy)',
            width: 600,
            padding: '3em',
            background: '#fff',
            backdrop: `
              rgba(0,0,123,0.4)
              url("https://sweetalert2.github.io/images/nyan-cat.gif")
              left top
              no-repeat
            `
          })
    }
}

const AddPoints = ({setShow}) => {

    const requestAddPoints = (pointString, speakerId) => {

        if(!Number.isNaN(Number.parseFloat(pointString))){
            socket.emit('add-points', pointString, speakerId);
        }else{
            alert('Please enter a valid number');
        }
    }

    return(
        <Layer
          onEsc={() => setShow(false)}
          onClickOutside={() => setShow(false)}
          background ={{color: "dark-2"}}
        >
          <Box
          direction = "column"
          pad = "medium"
          gap = "medium">
            <Text>Selected: {selectedParticipantName}</Text>
            <Box 
            direction = "column"
            gap = "small">
                <Text> Reward Points</Text>
                <Box 
                direction = "row"
                gap = "small" >
                    <Button label = "1" onClick ={() => requestAddPoints("1",selectedParticipantId)}/>
                    <Button label = "2" onClick ={() => requestAddPoints("2",selectedParticipantId)}/>
                    <Button label = "3" onClick ={() => requestAddPoints("3",selectedParticipantId)}/>
                    <Button label = "5" onClick ={() => requestAddPoints("5",selectedParticipantId)}/>
                    <Button label = "8" onClick ={() => requestAddPoints("8",selectedParticipantId)}/>
                </Box>
            </Box>

            <Box 
            direction = "column"
            gap = "small">
                <Text> Penalty Points</Text>
                <Box 
                direction = "row"
                gap = "small" >
                    <Button label = "1" onClick ={() => requestAddPoints("-1",selectedParticipantId)}/>
                    <Button label = "2" onClick ={() => requestAddPoints("-2",selectedParticipantId)}/>
                    <Button label = "3" onClick ={() => requestAddPoints("-3",selectedParticipantId)}/>
                    <Button label = "5" onClick ={() => requestAddPoints("-5",selectedParticipantId)}/>
                    <Button label = "8" onClick ={() => requestAddPoints("-8",selectedParticipantId)}/>
                </Box>
            </Box>

            <Form onSubmit={({ value }) => requestAddPoints(value.addPoints,selectedParticipantId)}>
                <FormField name="addPoints" htmlFor="textinput-id" label="Custom points">
                    <TextInput id="textinput-id" name="addPoints" />
                </FormField>
                <Box direction="row">
                    <Button type="submit" primary label="Submit" />
                </Box>
            </Form>

          </Box>
        </Layer>
    );
}

export default function HostPointsTable()
{
    const [pointsMap, setPointsMap] = useState(new Map());
    const [currentSpeaker, setCurrentSpeaker] = useState('NA');
    const [selectedParticipant, setSelectedParticipant] = useState('NA');
    const [showAddPoints, setShowAddPoints] = useState(false);

    const dataTablePoints = useMemo(() =>{
        let listItems = [];

        pointsMap.forEach((value,key) =>{
            listItems.push(
                {
                    'nickname' : value.nickname,
                    'points' : value.points.toFixed(3),
                    'uniqueId' : key
                }
            );
        });

        return listItems;
    },[pointsMap]);

    useEffect(()=>{
        hostPointUpdates(setPointsMap, setCurrentSpeaker);
    }, []);

    return(
        <Box 
        direction ="column"
        gap = "medium">

             <Box 
            direction = "row"
            gap = "medium"
            pad = "small">
                <Box 
                direction = "column"
                margin = "none"
                width = "medium"
                >
                    <Text>Selected : <BeautifyName name = {selectedParticipant}/></Text>
                    <Text>Current Speaker : <BeautifyName name = {currentSpeaker}/></Text>
                </Box>
                <Box 
                border = {{color : "brand"}}
                pad = "small"
                hoverIndicator
                onClick ={selectSpeaker}>Set Speaker</Box>
                <Box 
                border = {{color : "brand"}}
                pad = "small"
                hoverIndicator
                onClick ={() => setShowAddPoints(true)}>Add Points</Box>
                {showAddPoints && (<AddPoints setShow = {setShowAddPoints}/>)}

            </Box>

            <Box 
            direction = "column"
            flex = "grow">
                <DataTable
                columns = {[
                    {
                        property: 'nickname',
                        header:<Text weight="bold">Name</Text>,
                        render: (datum) => <BeautifyName name = {datum.nickname}/>
                    },
                    {
                        property: 'points',
                        header: <Text weight="bold">Points</Text>,
                    }
                ]}

                onClickRow = { ({datum}) =>{
                    setSelectedParticipant(datum.nickname);
                    selectedParticipantName = datum.nickname;
                    selectedParticipantId = datum.uniqueId;
                }}

                data={dataTablePoints}
                sortable = {true}
                />

            </Box>

        </Box>
    );
}