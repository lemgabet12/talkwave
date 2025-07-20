const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: { origin: "*" }
});

let waitingUser = null;

io.on("connection", socket => {
  console.log("User connected:", socket.id);

  socket.on("ready", () => {
    if (waitingUser) {
      socket.partner = waitingUser;
      waitingUser.partner = socket;

      socket.emit("readyToCall");
      waitingUser.emit("readyToCall");

      waitingUser = null;
    } else {
      waitingUser = socket;
    }
  });

  socket.on("offer", data => {
    if (socket.partner) socket.partner.emit("offer", data);
  });

  socket.on("answer", data => {
    if (socket.partner) socket.partner.emit("answer", data);
  });

  socket.on("candidate", data => {
    if (socket.partner) socket.partner.emit("candidate", data);
  });

  socket.on("disconnect", () => {
    if (waitingUser === socket) {
      waitingUser = null;
    }
    if (socket.partner) {
      socket.partner.emit("disconnect");
      socket.partner.partner = null;
    }
  });
});

http.listen(3000, () => {
  console.log("Signaling server running on port 3000");
});
