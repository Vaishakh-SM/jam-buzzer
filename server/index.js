const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;

const crypto = require("crypto");
const server = http.createServer();

const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000"
    },
  });

const roomStore = new Map();
const socketStore = new Map();
const playerStore = new Map();

function updateRoomStore(roomId, attributeName, attributeValue)
{
  let initial = roomStore.get(roomId);
  let updated = initial;
  updated[attributeName] = attributeValue;
  roomStore.set(roomId, updated);
}

function updatePlayerStore(uniqueId, attributeName, attributeValue)
{
  let initial = playerStore.get(uniqueId);
  let updated = initial;
  updated[attributeName] = attributeValue;
  roomStore.set(uniqueId, updated);
}

function onDisconnect(socket) {

  socket.on("disconnect", () => 
  {
    if(socketStore.has(socket.id)) {

      let uniqueId = socketStore.get(socket.id);
      let roomId = playerStore.get(uniqueId).roomId;
      socketStore.delete(socket.id);

      updateRoomStore(roomId, 'numberOfPlayers', roomStore.get(roomId).numberOfPlayers - 1);

      if(roomStore.get(roomId).numberOfPlayers == 0)
      {
        for(let redundantId in roomStore.get(roomId).players)
        {
          if(playerStore.has(redundantId))
            playerStore.delete(redundantId);
        }

        roomStore.delete(roomId);
        console.log("Deleted room ",roomId);
      }
    }

    console.log(socket.id + " disconnected")
  })
}

function onHostLogin(socket) {

  socket.on('host-login',() => {
    let roomId = crypto.randomBytes(16).toString("hex").substr(0,8);

    while(roomStore.has(roomId))
      roomId = crypto.randomBytes(16).toString("hex").substr(0,8);

    let uniqueId = crypto.randomBytes(16).toString("hex").substr(0,10);

    while(playerStore.has(uniqueId))
      uniqueId = crypto.randomBytes(16).toString("hex").substr(0,10);

    roomStore.set(roomId,{
      players : [uniqueId],
      numberOfPlayers: 1,
      buzzes : [],
      timeRemaining : 60,
      points : [],
      host : uniqueId
    });

    
    socketStore.set(socket.id,uniqueId);

    playerStore.set(uniqueId, {
      nickname:'host',
      roomId:roomId,
      points : 0
    });

    socket.join(roomId);
    io.to(roomId).emit('host-login-success', uniqueId, roomId);
  })

}

function onPlayerLogin(socket) {
  socket.on('player-login', (socketId,roomId, nickname) => {

    if(roomStore.has(roomId))
    {
      let uniqueId = crypto.randomBytes(16).toString("hex").substr(0,10);

      while(playerStore.has(uniqueId))
        uniqueId = crypto.randomBytes(16).toString("hex").substr(0,10);

      socketStore.set(socket.id,uniqueId);
      playerStore.set(uniqueId, {
        nickname:nickname,
        roomId:roomId,
        points : 0
      });
      
      updateRoomStore(roomId, 'numberOfPlayers', roomStore.get(roomId).numberOfPlayers + 1);
      updateRoomStore(roomId, 'players', roomStore.get(roomId).players.concat(uniqueId));

      io.to(socketId).emit('player-login-success', uniqueId, roomId, nickname);
      socket.join(roomId);
    }
    else{
      io.to(socketId).emit('player-login-fail');
    }

  })

}

function onBuzz(socket) {
  socket.on('buzz', () => {

    let uniqueId = socketStore.get(socket.id);

    let roomId = playerStore.get(uniqueId).roomId;
    let nickname = playerStore.get(uniqueId).nickname;

    let buzzes = roomStore.get(roomId).buzzes;
    buzzes.push(nickname);

    io.to(roomId).emit('update-buzzes', buzzes);
    io.to(roomId).emit('lock-buzzer', uniqueId);
})

}

function onRecoverSession(socket)
{
  socket.on('player-recover-session', (uniqueId) =>
  {
    if(playerStore.has(uniqueId) && 
    roomStore.has(playerStore.get(uniqueId).roomId) &&
    roomStore.get(playerStore.get(uniqueId).roomId).host != uniqueId)
    {
      let roomId = playerStore.get(uniqueId).roomId;
      let nickname = playerStore.get(uniqueId).nickname;

      socket.join(roomId);
      socketStore.set(socket.id,uniqueId);
      updateRoomStore(roomId, 'numberOfPlayers', roomStore.get(roomId).numberOfPlayers + 1);

      io.to(roomId).emit('player-recover-session-success',uniqueId, roomId, nickname);
    }else {
      io.to(socket.id).emit('player-recover-session-fail');
    }
  })
  

  socket.on('host-recover-session', (uniqueId) =>
  {
    if(playerStore.has(uniqueId) && 
    roomStore.has(playerStore.get(uniqueId).roomId) &&
    roomStore.get(playerStore.get(uniqueId).roomId).host === uniqueId)
    {
      let roomId = playerStore.get(uniqueId).roomId;
      let nickname = playerStore.get(uniqueId).nickname;

      socket.join(roomId);
      socketStore.set(socket.id,uniqueId);
      updateRoomStore(roomId, 'numberOfPlayers', roomStore.get(roomId).numberOfPlayers + 1);

      io.to(roomId).emit('host-recover-session-success',uniqueId, roomId, nickname);
    }else {
      io.to(socket.id).emit('host-recover-session-fail');
    }
  })

}

io.on("connection", (socket) => {

  console.log(socket.id + " connected ");
  
  onDisconnect(socket);

  onHostLogin(socket);

  onPlayerLogin(socket);

  onRecoverSession(socket);

  onBuzz(socket);

})


server.listen(port, () => console.log(`Listening on port ${port}`));