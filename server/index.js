const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;
const dataStore = new Map()

const crypto = require("crypto");


// Store the following in dataStore
// RoomId : object
// object 
// Buzzes (Which can be reset by host)
// Points chart (Which can also be managed by host)
// Timer details, like time left etc.

// Basically now the diea is, whenver host emits an event, 
// we can change these states however we want and we can send it
// to everyone in frontend

const server = http.createServer();

const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

io.on("connection", (socket) => {

  console.log(socket.id + " connected ");
  // User connect
  socket.on("disconnect", () => console.log(socket.id+ " disconnected"))
  // User disconnect

  // Host Side

  socket.on('create-room',() => {
    let roomId = crypto.randomBytes(16).toString("hex").substr(0,8);

    while(dataStore.has(roomId))
    {
      roomId = crypto.randomBytes(16).toString("hex").substr(0,8);
    }

    socket.join(roomId);
    io.to(roomId).emit('created-room', roomId)
  })


  // Player Side
  socket.on('login', (data) => {
    socket.join(data)
  })
  // User login
  
  socket.on('buzz', (data) => {
      io.to(data.roomId).emit('buzzed', data.username)

      // Here the timers should change
      // Buzzes is added in the map
  })
  // User buzz

  
  

})


server.listen(port, () => console.log(`Listening on port ${port}`));