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
        const leader = this.#participants[0];

        if (isNewJoin) {
            leader.socket.send(createResponse("getTime", ""));
        }
        else {
            leader.socket.send(createResponse("getTimeAutoSync", ""));
        }
    }

    //  Syncs all participants to time. Forces pause state [To match new participant state]
    syncAllNewJoin(time) {
        this.emitSync("syncAllNewJoin", time);
    }
    syncAll(time) {
        this.emitSync("syncAll", time);
    }
    emitSync(tag, time) {
        this.#participants.forEach((participant) => {
            participant.socket.send(createResponse(tag, time));
        });
    }

    emitPause(fromParticipant) {
        this.emitOperation("pause", fromParticipant);
    }
    emitPlay(fromParticipant) {
        this.emitOperation("play", fromParticipant);
    }
    emitSeek(fromParticipant, seekTo) {
        this.emitOperation("seek", fromParticipant, seekTo);
    }
    emitOperation(tag, fromParticipant, seekTo = "") {
        this.#participants.forEach((participant) => {
            if (participant == fromParticipant) {
                return;
            }
            participant.socket.send(createResponse(tag, seekTo, fromParticipant.name));
        });
    }

}

module.exports = Synchronizer;