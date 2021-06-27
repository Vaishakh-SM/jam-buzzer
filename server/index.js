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
  initial[attributeName] = attributeValue;
  roomStore.set(roomId, initial);
}

function playerGetAllComponents(uniqueId, roomId, buzzes, time, points, buzzerLocked){

  io.to(roomId).emit('update-buzzes',uniqueId,buzzes);

  if(buzzerLocked === true){
    io.to(roomId).emit('lock-buzzer',uniqueId);
  } else {
    io.to(roomId).emit('unlock-buzzer',uniqueId)
  }

  if(roomStore.get(roomId).gameRunning === true){
    io.to(roomId).emit('start-timer',uniqueId);

    let currentTime = Date.now();
    let elapsedTime = Math.min(roomStore.get(roomId).timeRemaining,
    currentTime - roomStore.get(roomId).timestamp);
    let timeLeft = Math.max(0,roomStore.get(roomId).timeRemaining - elapsedTime);
    
    io.to(roomId).emit('set-time',uniqueId, timeLeft);

  } else {
    io.to(roomId).emit('set-time',uniqueId, time);
  } 

  io.to(roomId).emit('update-points', uniqueId, Array.from(points));
}

function hostGetAllComponents(uniqueId, roomId, buzzes, time, points){
  io.to(roomId).emit('update-buzzes',uniqueId,buzzes);
  io.to(roomId).emit('set-time',uniqueId, time);
  io.to(roomId).emit('update-points', uniqueId, Array.from(points));
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
      timeRemaining : 60000,
      points : new Map(),
      host : uniqueId,
      timestamp: null,
      weightTime: 0,
      currentSpeaker: null,
      gameRunning: false,
      buzzerLocked : new Set()
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
      
      nickname = nickname + '#' + uniqueId.substr(7,10);

      socketStore.set(socket.id,uniqueId);
      playerStore.set(uniqueId, {
        nickname:nickname,
        roomId:roomId
      });
      
      updateRoomStore(roomId, 'numberOfPlayers', roomStore.get(roomId).numberOfPlayers + 1);
      updateRoomStore(roomId, 'players', roomStore.get(roomId).players.concat(uniqueId));
      roomStore.get(roomId).points.set(uniqueId, 
        {
          nickname: nickname,
          points: 0
        });

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

    if(roomStore.get(roomId).buzzerLocked.has(uniqueId) === false){
      let buzzes = roomStore.get(roomId).buzzes;
      buzzes.push(nickname);

      io.to(roomId).emit('update-buzzes-all', buzzes);
      io.to(roomId).emit('lock-buzzer', uniqueId);
      io.to(roomId).emit('emit-buzzer-sound');

      if(roomStore.get(roomId).gameRunning === true){
          let currentTime = Date.now();
          io.to(roomId).emit('stop-timer-all');
          let elapsedTime = Math.min(roomStore.get(roomId).timeRemaining,
          currentTime - roomStore.get(roomId).timestamp);

          let timeLeft = Math.max(0,roomStore.get(roomId).timeRemaining - elapsedTime);
          let currentPoints = roomStore.get(roomId).points;
          let currentSpeaker = roomStore.get(roomId).currentSpeaker;
          let currentSpeakerPoints = currentPoints.get(currentSpeaker).points;
          let weightTime = roomStore.get(roomId).weightTime;

          let finalPoints = currentPoints.set(currentSpeaker,
            {
              nickname:playerStore.get(currentSpeaker).nickname,
              points: currentSpeakerPoints + Math.max(0, Math.min(roomStore.get(roomId).timeRemaining,
              (elapsedTime - weightTime)/1000))
            });

          updateRoomStore(roomId, 'timeRemaining', timeLeft);
          updateRoomStore(roomId, 'gameRunning', false);
          io.to(roomId).emit('set-time-all',timeLeft);
          io.to(roomId).emit('update-points-all', Array.from(finalPoints));
      }
      updateRoomStore(roomId, 'buzzerLocked', roomStore.get(roomId).buzzerLocked.add(uniqueId));
    }
    
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
  

  socket.on('host-recover-session', (uniqueId) => {
    if(playerStore.has(uniqueId) && 
    roomStore.has(playerStore.get(uniqueId).roomId) &&
    roomStore.get(playerStore.get(uniqueId).roomId).host === uniqueId)
    {
      let roomId = playerStore.get(uniqueId).roomId;
      let nickname = playerStore.get(uniqueId).nickname;
      
      if(socket.roomId !== roomId)
        socket.join(roomId);
      
      if(socketStore.has(socket.id) === false){
        socketStore.set(socket.id,uniqueId);
        updateRoomStore(roomId, 'numberOfPlayers', roomStore.get(roomId).numberOfPlayers + 1);
      }

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

  socket.on('clear-buzzers-all',()=>{
    [uniqueId, roomId, hostId] = getIds();
    if(uniqueId === hostId){

      updateRoomStore(roomId, 'buzzes', []);
      updateRoomStore(roomId, 'buzzerLocked', new Set());
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

    if(roomStore.get(roomId).gameRunning === false){
        if(uniqueId === hostId){
          if(roomStore.get(roomId).currentSpeaker !== null)
          {
            let timeOffset = Date.now() + roomStore.get(roomId).timeRemaining;
            updateRoomStore(roomId, 'timestamp', Date.now());
            updateRoomStore(roomId, 'gameRunning', true);
            io.to(roomId).emit('start-timer-all', timeOffset);

          } else {
            io.to(roomId).emit('start-timer-failed',uniqueId);
          }

        } else {
          io.to(roomId).emit('not-authorised',uniqueId);
        }
      }
  })

  socket.on('stop-timer-all', () =>{
    [uniqueId, roomId, hostId] = getIds();

    if(roomStore.get(roomId).gameRunning === true)
    {
      if(uniqueId === hostId){

        let currentTime = Date.now();
        io.to(roomId).emit('stop-timer-all');

        let elapsedTime = Math.min(roomStore.get(roomId).timeRemaining,
        currentTime - roomStore.get(roomId).timestamp);

        let timeLeft = Math.max(0,roomStore.get(roomId).timeRemaining - elapsedTime);

        let currentPoints = roomStore.get(roomId).points;
        let currentSpeaker = roomStore.get(roomId).currentSpeaker;
        let currentSpeakerPoints = currentPoints.get(currentSpeaker).points;
        let weightTime = roomStore.get(roomId).weightTime;

        let finalPoints = currentPoints.set(currentSpeaker,
          {
            nickname:playerStore.get(currentSpeaker).nickname,
            points: currentSpeakerPoints + Math.max(0, (elapsedTime - weightTime)/1000)
          });

        updateRoomStore(roomId, 'timeRemaining', timeLeft);
        io.to(roomId).emit('set-time-all',timeLeft);
        io.to(roomId).emit('update-points-all', Array.from(finalPoints));
        updateRoomStore(roomId, 'gameRunning', false);
      }else {
        io.to(roomId).emit('not-authorised',uniqueId);
      }
    }

  })

  socket.on('add-points', (pointString, speakerId) =>{
    [uniqueId, roomId, hostId] = getIds();

    addAmount = parseFloat(pointString);

    if(!isNaN(addAmount) && (uniqueId === hostId)){
      let currentPoints = roomStore.get(roomId).points;
      let currentSpeakerPoints = currentPoints.get(speakerId).points;

      let finalPoints = currentPoints.set(speakerId,
        {
          nickname:playerStore.get(speakerId).nickname,
          points: currentSpeakerPoints + addAmount
        });
      io.to(roomId).emit('update-points-all', Array.from(finalPoints));
    }
  })

  socket.on('set-weight-time',(weightTimeString) =>{
    [uniqueId, roomId, hostId] = getIds();

    let _weightTime = parseInt(weightTimeString, 10);

    if(uniqueId === hostId && !isNaN(_weightTime)){
      updateRoomStore(roomId, "weightTime", _weightTime);
    }
  })

  socket.on('set-time', (timeRemainingString) =>{
    [uniqueId, roomId, hostId] = getIds();

    let _timeRemaining = parseInt(timeRemainingString, 10);

    if(uniqueId === hostId && !isNaN(_timeRemaining)){
      updateRoomStore(roomId, "timeRemaining", _timeRemaining);
      io.to(roomId).emit('set-time-all',_timeRemaining);
    }
  })

  socket.on('hide-timers', (isHidden) =>{
    [uniqueId, roomId, hostId] = getIds();
    if(uniqueId === hostId ){
      if(isHidden)
      {
        io.to(roomId).emit('hide-timer-all', hostId);
      } else{
        io.to(roomId).emit('unhide-timer-all');
      }
    }
  })

  socket.on('reset-game', () =>{
    [uniqueId, roomId, hostId] = getIds();
    if(uniqueId === hostId ){
  
      updateRoomStore(roomId, 'buzzes', []);
      updateRoomStore(roomId, 'timeRemaining', 60000);
      let playerList = roomStore.get(roomId).players;

      for(let playerUniqueId of playerList){ 
        if(playerUniqueId !== hostId){
          roomStore.get(roomId).points.set(playerUniqueId, 
          {
            nickname: playerStore.get(playerUniqueId).nickname,
            points: 0
          });
        }
      }

      updateRoomStore(roomId, 'timestamp', null);
      updateRoomStore(roomId, 'weightTime', 0);
      updateRoomStore(roomId, 'currentSpeaker', null);
      updateRoomStore(roomId, 'gameRunning', false);
      updateRoomStore(roomId, 'buzzerLocked', []);

      io.to(roomId).emit('update-points-all', Array.from(roomStore.get(roomId).points));
      io.to(roomId).emit('update-buzzes-all', roomStore.get(roomId).buzzes);
      io.to(roomId).emit('set-time-all', 60000);
    }
  })
}

function onPlayerFetch(socket){
  socket.on('player-fetch-components', () =>{
    let uniqueId = socketStore.get(socket.id);
    let roomId = playerStore.get(uniqueId).roomId;
  
      playerGetAllComponents(uniqueId, roomId, roomStore.get(roomId).buzzes,
    roomStore.get(roomId).timeRemaining, roomStore.get(roomId).points,
    roomStore.get(roomId).buzzerLocked.has(uniqueId));
  })
}

function onHostFetch(socket){
  socket.on('host-fetch-components', () =>{
    let uniqueId = socketStore.get(socket.id);
    let roomId = playerStore.get(uniqueId).roomId;
    hostGetAllComponents(uniqueId, roomId, roomStore.get(roomId).buzzes,
    roomStore.get(roomId).timeRemaining, roomStore.get(roomId).points);
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

  onPlayerFetch(socket);

  onHostFetch(socket);
})


server.listen(port, () => console.log(`Listening on port ${port}`));