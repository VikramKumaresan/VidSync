import participantClass from "./participant";
import createResponse from "./utils/createResponse";

class Room {
    #partialParticipants;
    #participants;
    #wssInstance;

    constructor(wss) {
        this.#participants = Array();
        this.#partialParticipants = Array();
        this.#wssInstance = wss;
    }

    addParticipant(socket) {
        //Add to partialParticipants
        var participant = new participantClass(socket);
        this.#partialParticipants.push(participant);
    }

    updateParticipant(socket, name, videoSrc) {
        //Update and add to participants

        for (let i = 0; i < this.#partialParticipants.length; i++) {
            if (this.#partialParticipants[i] == socket) {
                this.#partialParticipants[i].videoSrc = videoSrc;
                this.#partialParticipants[i].name = name;

                this.#participants.push(this.#partialParticipants[i]);
                this.#partialParticipants.splice(i, 1);
                break;
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
        this.#participants.forEach((participant) => {
            participant.send(createResponse("message", "Room has been closed!"));
        })
        this.#participants = Array();
        this.#partialParticipants = Array();
    }
}

export default Room;