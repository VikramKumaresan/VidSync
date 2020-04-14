const createResponse = require("./utils/createResponse");

class AdminOperations {
    #participants;
    #partialParticipants;


    constructor(participants, partialParticipants) {
        this.#participants = participants;
        this.#partialParticipants = partialParticipants;

        //  Auto update time
        setInterval(() => { this.startUpdateTime(); }, 10000);
    }

    flushRoom() {
        //  Refresh full room

        this.#participants.forEach((participant) => {
            participant.socket.close();
        })
        this.#participants = Array();
        this.#partialParticipants = Array();
    }

    showRoomParticipants(res) {
        var responseParticipants = Array();

        this.#participants.forEach((participant) => {
            responseParticipants.push({ "name": participant.name, "playbackTime": participant.lastUpdatedPlaybackTime });
        })

        res.json({ "participants": responseParticipants });
    }

    startUpdateTime() {
        this.#participants.forEach((participant) => {
            participant.socket.send(createResponse("updateTime", ""));
        });
    }

}

module.exports = AdminOperations;