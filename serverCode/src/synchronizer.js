const createResponse = require("./utils/createResponse");

class Synchronizer {
    #participants

    constructor(participants) {
        this.#participants = participants;
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