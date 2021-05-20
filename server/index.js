// const express = require("express");
// const index = require("./routes/index");
// const app = express();
// app.use(index);

const http = require("http");
const socketIo = require("socket.io");

const port = process.env.PORT || 4001;

const dataStore = new Map()

const crypto = require("crypto");

const id = crypto.randomBytes(16).toString("hex").substr(0,8);

console.log(id);

const server = http.createServer();

const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
    },
  });

io.on("connection", (socket) => {

  console.log(socket.id + " connected ");
  // User entered

  socket.on('login', (data) => {
    socket.join(data)
  })
  // User login
  
  socket.on('buzz', (data) => {
      io.to(data.roomId).emit('buzzed', data.username)
  })
  // User buzz

  socket.on("disconnect", () => console.log(socket.id+ " disconnected"))
  // User disconnect

})


server.listen(port, () => console.log(`Listening on port ${port}`));