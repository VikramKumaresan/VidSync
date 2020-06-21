import VideoTagOperator from './videoTagOperator';
import { onPlay, onPause, onSeek, onBuffer, onBufferComplete } from './videoTagListeners';
const TIME_RANGE = 4;

export default class VideoTagManager {
    //  Instance Variables
    //      videoTag
    //      videoTagOperatorInstance
    //      isListenersAttached

    constructor() {
        this.videoTag = document.getElementsByTagName("video")[0];
        this.videoTagOperatorInstance = new VideoTagOperator(this.videoTag);
        this.isListenersAttached = false;
    }

    async isAutoPlayAllowed() {
        try {
            await this.videoTag.play();
            this.videoTag.pause();
            return true;
        } catch (e) { return false; }
    }

    getVideoTag() { return this.videoTag; }

    isVideoTagReady() {
        if (this.videoTag.readyState == this.videoTag.HAVE_NOTHING)
            return false;
        return true;
    }

    isWithinTimeRange(roomTime) {
        if (Math.abs(this.videoTag.currentTime - parseFloat(roomTime)) < TIME_RANGE)
            return true;
        return false;
    }

    isVideoTagBuffering() {
        if (this.videoTag.readyState < this.videoTag.HAVE_FUTURE_DATA)
            return true;
        return false;
    }

    attachVideoTagListeners() {
        if (this.isListenersAttached)
            return;

        this.videoTag.onplay = () => { onPlay(this) };
        this.videoTag.onpause = () => { onPause(this) };
        this.videoTag.onseeking = () => { onSeek(this) };
        this.videoTag.onwaiting = () => { onBuffer(this) };
        this.videoTag.onplaying = () => { onBufferComplete(this) };
    }
}