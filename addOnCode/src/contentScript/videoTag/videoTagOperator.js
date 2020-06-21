export default class VideoTagOperator {
    //  Instance Variables
    //     videoTag
    //     isPlayFromSocketExecution
    //     isPauseFromSocketExecution
    //     isSeekFromSocketExecution
    //     wasBuffering

    constructor(videoTag) {
        this.videoTag = videoTag;
        this.isPlayFromSocketExecution = false;
        this.isPauseFromSocketExecution = false;
        this.isSeekFromSocketExecution = false;
        this.wasBuffering = false;
    }

    socketPause() {
        this.isPauseFromSocketExecution = true;
        this.videoTag.pause();
    }

    socketPlay() {
        this.isPlayFromSocketExecution = true;
        this.videoTag.play();
    }

    socketSeek(seekTo) {
        this.isSeekFromSocketExecution = true;
        this.videoTag.currentTime = seekTo;
    }

    socketSyncAllNewJoin(syncTime) {
        if (!this.videoTag.paused) {
            this.socketPause();
        }
        this.socketSeek(syncTime);
    }
}