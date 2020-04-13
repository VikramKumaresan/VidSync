const createResponse = require("./utils/createResponse");

class Synchronizer {
    #participants

    constructor(participants) {
        this.#participants = participants;

        //  Auto Sync 
        setInterval(() => { this.startSyncAll(false); }, 10000);
    }

    //  Requests leader for current time
    startSyncAll(isNewJoin) {
        if (this.#participants.length <= 1) {
            return;
        }
        let leader = this.#participants[0];

        if (isNewJoin) {
            leader.socket.send(createResponse("getTime", ""));
        }
        else {
            leader.socket.send(createResponse("getTimeAutoSync", ""));
        }
    }

    //  Syncs all participants to time. Forces pause state [To match new participant state]
    syncAllNewJoin(time) {
        this.#participants.forEach((participant) => {
            participant.socket.send(createResponse("syncAllNewJoin", time));
        });
    }

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