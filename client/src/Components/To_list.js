import React from 'react';

export function ArrayToList(props){

    let listItems = props.array.map((item, index) => {
        return (<li key = {index}>{index + 1} : {item}</li>);
    });
   
    return(
        <ul>{listItems}</ul>
    );
}

export function MapToList(props){
    let listItems = [];

    props.map.forEach((value, key) =>{
        let elem = (<li>{key} {'->'} {value}</li>);
        listItems.push(elem);
    })

    return(
        <ul>{listItems}</ul>
    );
}

export function HostPointsToList(props){
    let listItems = [];

    props.map.forEach((value, key) =>{
        let elem = (<li key ={key} value = {key} onClick = {props.onClick}>{value.nickname} {":"} {value.points}</li>);
        listItems.push(elem);
    })

    return(
        <ul>{listItems}</ul>
    );
}