import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:4001";
let socket = socketIOClient(ENDPOINT);

export async function createRoom(setRoomId)
{
    socket.nickname = "host" 
    socket.emit("create-room")
    socket.on('created-room', (roomId) =>{
        socket.roomId = roomId
        setRoomId(socket.roomId)
    })
}

export default socket