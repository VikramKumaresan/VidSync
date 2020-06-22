const createResponse = require("./utils/createResponse");

class Participant {
    socket;
    videoSrc;
    name;
    lastUpdatedPlaybackTime = null;
    roomInstance;

    constructor(socket, roomInstance) {
        this.socket = socket;
        this.videoSrc = null;
        this.name = null;
        this.roomInstance = roomInstance;

        this.attachOnCloseListener();
        this.attachUpdateListener();
    }

    attachOnCloseListener() {
        this.socket.on("close", () => {
            this.roomInstance.removeParticipant(this)
        })
    }

    attachUpdateListener() {
        this.socket.on("message", (message) => {
            const messageObj = JSON.parse(message);

            if (messageObj["tag"] != "update")
                return;

            this.name = messageObj["name"];
            this.videoSrc = messageObj["videoSrc"];
            const result = this.roomInstance.updateParticipant(this);

            this.socket.send(createResponse("update", result));

            if (result["isUpdate"])
                this.attachOperationListeners();
            else
                this.socket.close();
        })
    }

    attachOperationListeners() {

        this.socket.on("message", (message) => {
            const messageObj = JSON.parse(message);

            switch (messageObj["tag"]) {

                case "seek":
                    this.roomInstance.synchronizeSeek(this, messageObj["seekTo"]);
                    break;

                case "pause":
                    this.roomInstance.synchronizePause(this);
                    break;

                case "play":
                    this.roomInstance.synchronizePlay(this);
                    break;

                case "getTime":
                    this.roomInstance.syncAllNewJoin(messageObj["currentTime"]);
                    break;

                //  Leader currentTime for auto sync
                case "getTimeAutoSync":
                    this.roomInstance.syncAll(messageObj["currentTime"]);
                    break;

                //  CurrentTime for auto update
                case "updateTime":
                    this.lastUpdatedPlaybackTime = messageObj["currentTime"];
                    break;

            }
        })
    }

}

module.exports = Participant;