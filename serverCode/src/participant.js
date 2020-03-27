class Participant {
    socket;
    videoSrc;
    name;

    constructor(socket, roomInstance) {
        this.socket = socket;
        this.videoSrc = null;
        this.name = null;

        this.attachListeners(roomInstance)
    }

    attachListeners(roomInstance) {
        this.socket.on("close", () => {
            roomInstance.removeParticipant(this.socket)
        })
        this.socket.on("message", (message) => {
            const messageObj = JSON.parse(message);

            //  Participant detail updation
            if (messageObj["tag"] == "update") {
                roomInstance.updateParticipant(this.socket, messageObj["name"], messageObj["videoSrc"]);
            }
        })
    }

}

module.exports = Participant;