const createResponse = require("./utils/createResponse");

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
            roomInstance.removeParticipant(this)
        })

        // If socket sends message
        this.socket.on("message", (message) => {
            const messageObj = JSON.parse(message);

            //  Participant detail updation
            if (messageObj["tag"] == "update") {
                this.name = messageObj["name"];
                this.videoSrc = messageObj["videoSrc"];
                const result = roomInstance.updateParticipant(this);

                //  Send updation status to socket
                this.socket.send(createResponse("update", result));
            }
            //  Participant seek
            else if (messageObj["tag"] == "seek") {
                roomInstance.synchronizeSeek(this, messageObj["seekTo"]);
            }
            //  Participant pause
            else if (messageObj["tag"] == "pause") {
                roomInstance.synchronizePause(this);
            }
            //  Participant play
            else if (messageObj["tag"] == "play") {
                roomInstance.synchronizePlay(this);
            }

        })

    }

}

module.exports = Participant;