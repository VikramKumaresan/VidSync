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

    updateParticipant(participant) {

        //  Compare with leader videoSrc
        const leaderVideoSrc = this.getRoomVideoSrc();
        if (leaderVideoSrc && (leaderVideoSrc != participant.videoSrc)) {
            return { "isUpdate": false, "videoSrc": leaderVideoSrc };
        }

        //  Update and add to participants
        for (let i = 0; i < this.#partialParticipants.length; i++) {
            if (this.#partialParticipants[i] == participant) {
                this.#participants.push(participant);
                this.#partialParticipants.splice(i, 1);

                //  Helps sync new participant to leader
                this.#synchronizerInstance.startSyncAll();

                return { "isUpdate": true };
            }
        }
    }

    removeParticipant(participant) {
        //  Called when socket disconnects

        for (let i = 0; i < this.#partialParticipants.length; i++) {
            if (this.#partialParticipants[i] == participant) {
                this.#partialParticipants.splice(i, 1);
                return;
            }
        }

        for (let i = 0; i < this.#participants.length; i++) {
            if (this.#participants[i] == participant) {
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

    showRoomParticipants(res) {
        var responseParticipants = Array();

        this.#participants.forEach((participant) => {
            responseParticipants.push(participant.name);
        })

        res.json({ "participants": responseParticipants });
    }

    //  Synchronize method calls
    synchronizePlay(participant) {
        this.#synchronizerInstance.emitPlay(participant);
    }
    synchronizePause(participant) {
        this.#synchronizerInstance.emitPause(participant);
    }
    synchronizeSeek(participant, seekTo) {
        this.#synchronizerInstance.emitSeek(participant, seekTo);
    }
    //  Syncs all participants to leader time 
    syncAll(leaderTime) {
        this.#synchronizerInstance.syncAll(leaderTime);
    }

}

module.exports = Room