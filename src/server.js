const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mediasoup = require("mediasoup");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// mediasoup server
const mediasoupServer = require("./mediasoup-config");

// express server set up
app.use(express.static("public"));

io.on("connection", (socket) => {
    console.log(`New connection at: ${socket.id}`);

    // join room logic
    socket.on("joinRoom", (roomId, callback) => {

    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected at: ${socket.id}`);
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});