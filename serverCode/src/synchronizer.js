const createResponse = require("./utils/createResponse");

class Synchronizer {
    #participants

    constructor(participants) {
        this.#participants = participants;
    }

    getSocketParticipant(socket) {
        for (let i = 0; i < this.#participants.length; i++) {
            if (socket == this.#participants[i].socket) {
                return this.#participants[i];
            }
        }
        return null
    }

    emitPause(socket) {
        const fromParticipant = this.getSocketParticipant(socket);
        if (fromParticipant == null) {
            return
        }

        this.#participants.forEach((participant) => {
            if (participant == fromParticipant) {
                return;
            }
            participant.socket.send(createResponse("pause", "", fromParticipant.name));
        });
    }

    emitPlay(socket) {
        const fromParticipant = this.getSocketParticipant(socket);
        if (fromParticipant == null) {
            return
        }

        this.#participants.forEach((participant) => {
            if (participant == fromParticipant) {
                return;
            }
            participant.socket.send(createResponse("play", "", fromParticipant.name));
        });
    }

    emitSeek(socket, seekTo) {
        const fromParticipant = this.getSocketParticipant(socket);
        if (fromParticipant == null) {
            return
        }

        this.#participants.forEach((participant) => {
            if (participant == fromParticipant) {
                return;
            }
            participant.socket.send(createResponse("seek", seekTo, fromParticipant.name));
        });
    }

}

module.exports = Synchronizer;