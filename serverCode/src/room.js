const participantClass = require("./participant");
const synchronizerClass = require("./synchronizer");
const createResponse = require("./utils/createResponse");

class Room {
    #partialParticipants;
    #participants;
    #synchronizerInstance;

    constructor(wss) {
        this.#participants = Array();
        this.#partialParticipants = Array();
        this.#synchronizerInstance = new synchronizerClass(this.#participants);
    }

    addParticipant(socket) {
        //  Add to partialParticipants
        var participant = new participantClass(socket, this);
        this.#partialParticipants.push(participant);
    }

    updateParticipant(socket, name, videoSrc) {
        //  Update and add to participants

        for (let i = 0; i < this.#partialParticipants.length; i++) {
            if (this.#partialParticipants[i].socket == socket) {
                this.#partialParticipants[i].videoSrc = videoSrc;
                this.#partialParticipants[i].name = name;

                this.#participants.push(this.#partialParticipants[i]);
                this.#partialParticipants.splice(i, 1);
                return;
            }
        }
    }

    removeParticipant(socket) {
        //  Called when socket disconnects

        for (let i = 0; i < this.#partialParticipants.length; i++) {
            if (this.#partialParticipants[i].socket == socket) {
                this.#partialParticipants.splice(i, 1);
                return;
            }
        }

        for (let i = 0; i < this.#participants.length; i++) {
            if (this.#participants[i].socket == socket) {
                this.#participants.splice(i, 1);
                return;
            }
        }
    }

    getRoomVideoSrc() {
        var roomLeader = this.#participants[0];
        if (roomLeader == undefined) {
            return null;
        }
        return roomLeader.videoSrc;
    }

    flushRoom() {
        //  Refresh full room

        this.#participants.forEach((participant) => {
            participant.socket.send(createResponse("message", "Room has been closed!"));
        })
        this.#participants = Array();
        this.#partialParticipants = Array();
    }

    //  Synchronize method calls
    synchronizePlay(socket) {
        this.#synchronizerInstance.emitPlay(socket);
    }
    synchronizePause(socket) {
        this.#synchronizerInstance.emitPause(socket);
    }
    synchronizeSeek(socket, seekTo) {
        this.#synchronizerInstance.emitSeek(socket, seekTo);
    }

}

module.exports = Room