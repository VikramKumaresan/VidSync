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

            switch (messageObj["tag"]) {

                //  Participant detail updation
                case "update":
                    this.name = messageObj["name"];
                    this.videoSrc = messageObj["videoSrc"];
                    const result = roomInstance.updateParticipant(this);

                    //  Send updation status to socket
                    this.socket.send(createResponse("update", result));
                    break;

                //  Participant seek
                case "seek":
                    roomInstance.synchronizeSeek(this, messageObj["seekTo"]);
                    break;

                //  Participant pause
                case "pause":
                    roomInstance.synchronizePause(this);
                    break;

                //  Participant play
                case "play":
                    roomInstance.synchronizePlay(this);
                    break;

                //  Leader currentTime
                case "getTime":
                    roomInstance.syncAll(messageObj["currentTime"]);
                    break;

            }

        })

    }

}

module.exports = Participant;