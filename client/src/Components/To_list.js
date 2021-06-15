import React from 'react';
import { DataTable, List, Text} from 'grommet';

export function ArrayToList(props){
    // Takes an array and returns a
    // grommet list

    let listItems = props.array.map((item) => {
        return ({name : item});
    });
   
    return(
        <List
        primaryKey="name"
        data = {listItems}></List>
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