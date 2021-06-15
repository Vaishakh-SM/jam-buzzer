import React, { useEffect, useMemo, useState } from 'react';
import { hostPointUpdates } from '../socket';
import { Box, Button, DataTable, Text, Layer, Form, FormField, TextInput } from 'grommet';
import socket from "../socket";

let currentSpeakerId = null;
let selectedParticipantId = null;
let selectedParticipantName = 'NA';

const selectSpeaker = () => {
    currentSpeakerId = selectedParticipantId;
    socket.emit('set-speaker', currentSpeakerId);
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
        direction ="row"
        gap = "medium">

            <Box 
            direction = "column"
            flex = "grow">
                <DataTable
                columns = {[
                    {
                        property: 'nickname',
                        header:<Text weight="bold">Name</Text>,
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

                <Box 
                direction = "row"
                gap = "medium"
                pad = "small">
                    <Text>Selected : {selectedParticipant}</Text>
                    <Text>Current Speaker : {currentSpeaker}</Text>
                </Box>

            </Box>

            <Box 
            direction="column"
            gap ="medium"
            justify = "center">
                <Button secondary label = "Set speaker" onClick ={selectSpeaker}/>
                <Button secondary label = "Add points" onClick ={() => setShowAddPoints(true)}/>
                {showAddPoints && (<AddPoints setShow = {setShowAddPoints}/>)}
            </Box>

        </Box>
    );
}