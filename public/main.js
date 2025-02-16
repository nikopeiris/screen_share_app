document.getElementById("join-button").addEventListener("click", () => {
    const username= document.getElementById("username").value;
    const roomId = document.getElementById("room-id").value;

    if(username && roomId){
        //connecting to the server and join room
        const socket = io();
        socket.emit("joinRoom", {username, roomId});

        // hide join screen and shows controls and view to user
        document.getElementById("join-screen").style.display = "none";
        document.getElementById("controls").style.display = "block";
        document.getElementById("participant-view").style.display = "block";

        let localStream;
        let audioEnabled = true;
        let videoEnabled = true;

        navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: true
        })
        .then(stream => {
            localStream = stream;

            addParticipantVideo("local", stream);

            socket.emit("newParticipant", {id: "local", stream});

            socket.on("newParticipant", ({id, stream}) => {
                addParticipantVideo(id, stream);
            });

            socket.on("participantLeft", id => {
                removeParticipantVideo(id);
            });
        })
        .catch(error => {
            console.log("Error accessing users media devices", error);
            alert("Can't access Users media devices. Please check your permissions.");
        });

        //mute button
        document.getElementById("mute-button").addEventListener("click", () => {
            audioEnabled = !audioEnabled;
            localStream.getAudioTracks()[0] = audioEnabled;
            document.getElementById("mute-button").textContent = audioEnabled ? "Mute" : "Unmute";
        });

        // video button
        document.getElementById("video-button").addEventListener("click", ()=> {
            videoEnabled = !videoEnabled;
            localStream.getVideoTracks()[0].enabled = videoEnabled;
            document.getElementById("video-button").textContent = videoEnabled ? "Disable Video" : "Enable Video";
        });

        // leave vutton
        document.getElementById("leave-button").addEventListener("click", ()=> {
            socket.emit("leaveRoom", {username, roomId});
            localStream.getTracks().forEach(track => track.stop());
            socket.disconnect();

            document.getElementById("join-screen").style.display = "block";
            document.getElementById("controls").style.display = "none";
            document.getElementById("participant-view").style.display = "none";
            document.getElementById("participant-view").innerHTML = "";
        });

        socket.on("connect", () => {
            console.log("Connected to the server");
        });

        socket.on("roomJoined", (data) => {
            console.log(`Joined room: ${data.roomId} as user: ${data.username}`);
        });

        socket.on("connect_error", (error) => {
            console.error("connection error", error);
            alert("connection failed. Please try again");
        });
    }
    else{
        alert("Please enter your Name and RoomID");
    }
});

const addParticipantVideo = (id, stream) => {
    console.log(stream);
    const videoElement = document.createElement("video");
    videoElement.id = id;
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    document.getElementById("participant-view").appendChild(videoElement);
};

const removeParticipantVideo = (id) => {
    const videoElement = document.getElementById(id);
    if(videoElement){
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.remove()
    }
};