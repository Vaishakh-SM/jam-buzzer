import React from 'react'

export default function Login(props)
{
    function submitHandler(event)
    {
        event.preventDefault();
        const username = document.getElementById('nickname-input').value
        const roomId = document.getElementById('room-input').value
        props.socket.username = username
        props.socket.roomId = roomId

        props.socket.emit('login', roomId)
        props.setUserStatus('player')
    }

    return(
        <div>
            <h1>Login</h1>
            <form onSubmit = {submitHandler}>
                <label>
                    Nickname
                    <input type = "text" id="nickname-input" name = "nickname" placeholder = "Enter Nickname" required/>
                </label>

                <label>
                    Room
                    <input type = "text" id = "room-input" name = "room" placeholder = "Enter Nickname" required/>
                </label>
                <button type = "submit">Submit</button>
            </form>
        </div>
    )
}