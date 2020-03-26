class Participant {
    socket;
    videoSrc;
    name;

    constructor(socket) {
        this.socket = socket;
        this.videoSrc = null;
        this.name = null;
    }

}

export default Participant;