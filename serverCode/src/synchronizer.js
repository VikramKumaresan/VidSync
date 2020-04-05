const createResponse = require("./utils/createResponse");

class Synchronizer {
    #participants

    constructor(participants) {
        this.#participants = participants;
    }

    //  Requests leader for current time
    startSyncAll() {
        if (this.#participants.length == 1) {
            return;
        }
        let leader = this.#participants[0];
        leader.socket.send(createResponse("getTime", ""));
    }

    //  Syncs all participants to time
    syncAll(time) {
        this.#participants.forEach((participant) => {
            participant.socket.send(createResponse("syncAll", time));
        });
    }

    emitPause(fromParticipant) {
        this.#participants.forEach((participant) => {
            if (participant == fromParticipant) {
                return;
            }
            participant.socket.send(createResponse("pause", "", fromParticipant.name));
        });
    }

    emitPlay(fromParticipant) {
        this.#participants.forEach((participant) => {
            if (participant == fromParticipant) {
                return;
            }
            participant.socket.send(createResponse("play", "", fromParticipant.name));
        });
    }

    emitSeek(fromParticipant, seekTo) {
        this.#participants.forEach((participant) => {
            if (participant == fromParticipant) {
                return;
            }
            participant.socket.send(createResponse("seek", seekTo, fromParticipant.name));
        });
    }

}

module.exports = Synchronizer;