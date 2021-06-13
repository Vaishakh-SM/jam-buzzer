import React from 'react';
import { DataTable, List, Text} from 'grommet';

export function ArrayToList(props){

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

export function HostPointsToTable(props){

    let listItems = [];

    // props.points.forEach((value, key) =>{
    //     let elem = (<li key ={key}>{value.nickname} {'->'} {value.points}</li>);
    //     listItems.push(elem);

    props.points.forEach((value,key) =>{
            listItems.push(
                {
                    'nickname' : value.nickname,
                    'points' : value.points.toFixed(3),
                    'uniqueId' : key
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

        onClickRow = { ({datum}) =>{
            console.log(datum);
        }}

        data={listItems}
        sortable = {true}
        />
    );
}
