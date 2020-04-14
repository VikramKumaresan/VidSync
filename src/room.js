const participantClass = require("./participant");
const synchronizerClass = require("./synchronizer");
const AdminOperationsClass = require("./adminOperations");

class Room {
    #partialParticipants;
    #participants;

    #synchronizerInstance;
    #adminOperationsInstance;

    constructor() {
        this.#participants = Array();
        this.#partialParticipants = Array();
        this.#synchronizerInstance = new synchronizerClass(this.#participants);
        this.#adminOperationsInstance = new AdminOperationsClass(this.#participants, this.#partialParticipants);
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
                this.#synchronizerInstance.startSyncAll(true);

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

    //  Admin Operations  
    flushRoom() {
        this.#adminOperationsInstance.flushRoom();
    }
    showRoomParticipants(res) {
        this.#adminOperationsInstance.showRoomParticipants(res);
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
    //  Syncs all participants + new participant to leader time 
    syncAllNewJoin(leaderTime) {
        this.#synchronizerInstance.syncAllNewJoin(leaderTime);
    }
    //  Syncs all participants to leader time (Auto sync)
    syncAll(leaderTime) {
        this.#synchronizerInstance.syncAll(leaderTime);
    }

}

module.exports = Room