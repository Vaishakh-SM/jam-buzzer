import React from 'react';

export function ArrayToList(props)
{

    let listItems = props.array.map((item, index) => {
        return (<li key = {index}>{index + 1} : {item}</li>)
    });
   
    return(
        <ul>{listItems}</ul>
    );
}