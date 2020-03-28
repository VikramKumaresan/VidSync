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

        //  If socket closes
        this.socket.on("close", () => {
            roomInstance.removeParticipant(this.socket)
        })

        // If socket sends message
        this.socket.on("message", (message) => {
            const messageObj = JSON.parse(message);

            //  Participant detail updation
            if (messageObj["tag"] == "update") {
                roomInstance.updateParticipant(this.socket, messageObj["name"], messageObj["videoSrc"]);
            }
            //  Participant seek
            else if (messageObj["tag"] == "seek") {
                roomInstance.synchronizeSeek(this.socket, messageObj["seekTo"]);
            }
            //  Participant pause
            else if (messageObj["tag"] == "pause") {
                roomInstance.synchronizePause(this.socket);
            }
            //  Participant play
            else if (messageObj["tag"] == "play") {
                roomInstance.synchronizePlay(this.socket);
            }

        })

    }

}

module.exports = Participant;