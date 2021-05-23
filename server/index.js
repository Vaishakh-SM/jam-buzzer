const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;

const crypto = require("crypto");
const server = http.createServer();

const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

const dataStore = new Map()
const socketStore = new Map()

// Everyone has unique ID set, in both session storage and
// backend. Now on reconnection we must re-establish it (done for host)
// Make a commit once done for player, make frequent commits

// When player enters, add him in participants of the room
// When player leaves remove
// If 0 people in room, delete room
// Take care of the same when recoer-session is called


io.on("connection", (socket) => {

  console.log(socket.id + " connected ");
  
  socket.on("disconnect", () => 
  {
    if(socketStore.has(socket.id))
    {
      socketStore.delete(socket.id)
    }

    console.log(socket.id+ " disconnected")
  })


  socket.on('host-login',() => {

    let roomId = crypto.randomBytes(16).toString("hex").substr(0,8)

    while(dataStore.has(roomId))
      roomId = crypto.randomBytes(16).toString("hex").substr(0,8)
    


    dataStore.set(roomId,{
      participants :[],
      buzzes : [],
      timeRemaining : 60,
      points :[],
      host : socket.id
    })

    let uniqueId = crypto.randomBytes(16).toString("hex").substr(0,10)
    socketStore.set(socket.id,
      {
        nickname : 'host',
        roomId : roomId,
        uniqueId : uniqueId
      })

    socket.join(roomId);
    io.to(roomId).emit('host-login-success', roomId, uniqueId)
  })


  socket.on('player-login', (socketId,roomId, nickname) => {

    if(dataStore.has(roomId))
    {
      let uniqueId = crypto.randomBytes(16).toString("hex").substr(0,10);
      socketStore.set(socketId,
        {
          nickname : nickname,
          roomId : roomId,
          uniqueId : uniqueId
        })

      io.to(socketId).emit(
      'setAttribute', 
      socketId, 
      {
        'roomId': roomId,
        'nickname' : nickname,
        'uniqueId': uniqueId
      })

      io.to(socketId).emit('player-login-success')
      socket.join(roomId)
    }
    else{
      io.to(socketId).emit('player-login-fail')
    }

  })

  socket.on('buzz', () => {

      let roomId = socketStore.get(socket.id).roomId
      let nickname = socketStore.get(socket.id).nickname

      let buzzes = dataStore.get(roomId).buzzes
      buzzes.push(nickname)

      io.to(roomId).emit('update-buzzes', buzzes)
  })

  socket.on('recover-session', (uniqueId, roomId, nickname) =>
  {
    socket.join(roomId)
    socketStore.set(socket.id,
      {
        nickname : nickname,
        roomId : roomId,
        uniqueId : uniqueId
      })

      io.to(roomId).emit('recover-session-success',uniqueId)
  })
  

})


server.listen(port, () => console.log(`Listening on port ${port}`));