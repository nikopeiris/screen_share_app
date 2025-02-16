const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mediasoup = require("mediasoup");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// mediasoup server
const mediasoupServer = require("./mediasoup-config");
const {createWorker, getRouter} = require("./mediasoup-config");

// express server set up
app.use(express.static("public"));

(async() => {
    await createWorker();
})();

io.on("connection", (socket) => {
    console.log(`New connection at: ${socket.id}`);

    // join room logic
    socket.on("joinRoom", async({username, roomId}) => {
        const router = getRouter();
        console.log(`User joined room: ${roomId} as: ${username}`);

        socket.join(roomId);
        io.to(roomId).emit("roomJoined", {username, roomId});

        socket.on("newParticipant", ({id, stream}) => {
            console.log(stream);
            socket.to(roomId).emit("newParticipant", {id, stream});
        });

        socket.on("leaveRoom", ({username, roomId}) => {
            socket.leave(roomId);
            socket.to(roomId).emit("participantLeft", username);
        });

        const transport = await createWebRtcTransport(router);
        callback({transportOptions: transport});
    });

    socket.on("disconnect", () => {
        console.log(`Client disconnected at: ${socket.id}`);
    });
});

const createWebRtcTransport = async (router) => {
    const transport = await router.createWebRtcTransport({
        listenIps: [
            {
                ip: "0.0.0.0",
                announcedIp: null
            }
        ],
        enableUdp: true,
        enableTcp: true,
        preferudp: true
    });

    transport.on("dtlsstatechange", dtlState => {
        if(dtlState === "closed"){
            transport.close();
        }
    });

    transport.on("close", ()=> {
        console.log("transport close");
    });

    return transport;
};

server.listen(3000, () => {
    console.log("Server running on port 3000");
});