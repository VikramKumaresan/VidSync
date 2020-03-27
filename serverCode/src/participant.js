class Participant {
    socket;
    videoSrc;
    name;

    constructor(socket, roomInstance) {
        this.socket = socket;
        this.videoSrc = null;
        this.name = null;

        //  Attach socket event listener    
        socket.on("close", () => {
            roomInstance.removeParticipant(socket)
        })
        socket.on("message", (message) => {
            messageObj = JSON.parse(message);

            if (messageObj["tag"] == "update") {
                roomInstance.updateParticipant(socket, messageObj["name"], messageObj["videoSrc"]);
            }
        })

    }

}

module.exports = Participant;