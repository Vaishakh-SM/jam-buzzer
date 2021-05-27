const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;

const crypto = require("crypto");
const server = http.createServer();

const io = socketIo(server, {
    cors: {origin: "*"},
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
      points : new Map(),
      host : uniqueId,
      timestamp: null,
      weightTime: 0,
      currentSpeaker: null,
      gameRunning: false
    });

    
    socketStore.set(socket.id,uniqueId);

    playerStore.set(uniqueId, {
      nickname:'host',
      roomId:roomId
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
        roomId:roomId
      });
      
      updateRoomStore(roomId, 'numberOfPlayers', roomStore.get(roomId).numberOfPlayers + 1);
      updateRoomStore(roomId, 'players', roomStore.get(roomId).players.concat(uniqueId));
      updateRoomStore(roomId, 'points', roomStore.get(roomId).points.set(uniqueId, 
      {
        nickname: nickname,
        points: 0
      }));

      io.to(socketId).emit('player-login-success', uniqueId, roomId, nickname);
      socket.join(roomId);
      io.to(roomId).emit('update-points-all', Array.from(roomStore.get(roomId).points));
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

    io.to(roomId).emit('update-buzzes-all', buzzes);
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

function onHostRequest(socket) {

  function getIds(){
    let uniqueId = socketStore.get(socket.id);
    let roomId = playerStore.get(uniqueId).roomId;
    let hostId = roomStore.get(roomId).host;
    return [uniqueId, roomId, hostId];
  }

  socket.on('clear-buzzers',()=>{
    [uniqueId, roomId, hostId] = getIds();
    if(uniqueId === hostId){

      updateRoomStore(roomId, 'buzzes', []);
      io.to(roomId).emit('update-buzzes-all', []);
      io.to(roomId).emit('unlock-buzzer-all');
    }else {
      io.to(roomId).emit('not-authorised',uniqueId);
    }
  })

  socket.on('set-speaker', (speakerId) =>{
    [uniqueId, roomId, hostId] = getIds();
    if(uniqueId === hostId){

      updateRoomStore(roomId, 'currentSpeaker', speakerId);
      io.to(roomId).emit('set-current-speaker', playerStore.get(speakerId).nickname);

    }else {
      io.to(roomId).emit('not-authorised',uniqueId);
    }
  })

  socket.on('start-timer-all', () =>{
    [uniqueId, roomId, hostId] = getIds();
    if(uniqueId === hostId){
      io.to(roomId).emit('start-timer-all');

    }else {
      io.to(roomId).emit('not-authorised',uniqueId);
    }
  })

  socket.on('stop-timer-all', () =>{
    [uniqueId, roomId, hostId] = getIds();
    if(uniqueId === hostId){
      io.to(roomId).emit('stop-timer-all');

    }else {
      io.to(roomId).emit('not-authorised',uniqueId);
    }
  })

}

function onFetch(socket){
  socket.on('fetch-points', ()=>{
    let uniqueId = socketStore.get(socket.id);
    let roomId = playerStore.get(uniqueId).roomId;
    let points = roomStore.get(roomId).points;

    io.to(roomId).emit('response-points',uniqueId ,points);
  })
}

io.on("connection", (socket) => {

  console.log(socket.id + " connected ");
  
  onDisconnect(socket);

  onHostLogin(socket);

  onPlayerLogin(socket);

  onRecoverSession(socket);

  onBuzz(socket);

  onHostRequest(socket);

  onFetch(socket);
})


server.listen(port, () => console.log(`Listening on port ${port}`));