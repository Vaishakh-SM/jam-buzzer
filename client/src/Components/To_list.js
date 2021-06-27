import React from 'react';
import { DataTable, Text, Box} from 'grommet';

export function BeautifyName({name}){

    if(name === 'NA')
    {
        return (
            <Text>NA</Text>
        )
    }

    let splitWords = name.split('#');
    let beautifulName = "";
    let uglyId = "";

    splitWords.forEach((element, index) => {
        if(index !== splitWords.length - 1){
            beautifulName += element;
            beautifulName += '#';
        }else{
            uglyId += '#'
            uglyId += element;
        }
    });
    beautifulName = beautifulName.slice(0,-1);

    return (
        <Text>
            <Text>{beautifulName}</Text>
            <Text 
            size = "small"
            color= "dark-3">{uglyId}</Text>
        </Text>
    )
}

export function ArrayToList(props){
    // Takes an array and returns a
    // grommet list

    let listItems = props.array.map((item) => {
        return (
        <Box pad = "xsmall">
            <BeautifyName name = {item}/>
        </Box>
        )
    });
   
    return(
        <Box 
        direction ="column"
        pad ="xsmall">
            {listItems}
        </Box>
    );
}

export function PlayerPointsToTable(props){
    // Takes a map ('points') and 
    // returns a grommet DataTable

    let listItems = [];

    props.points.forEach((value) =>{
        listItems.push(
            {
                'nickname' : value.nickname,
                'points' : value.points.toFixed(3)
            }
        );
    })

    return(
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

        data={listItems}
        sortable = {true}
        />
    );
}