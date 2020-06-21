import tags from '../../tags';
import { emitMessageToBackgroundScript } from '../../utils/emitMessageMethods';

function getOperatorInstance(videoTagManager) { return videoTagManager.videoTagOperatorInstance; }

function onPlay(videoTagManager) {
    const operatorInstance = getOperatorInstance(videoTagManager);

    if (operatorInstance.isPlayFromSocketExecution) {
        operatorInstance.isPlayFromSocketExecution = false;
        return;
    }
    else if (videoTagManager.isVideoTagBuffering())
        return;

    emitMessageToBackgroundScript({ "tag": tags["socketServerTags"]["play"] });
}

function onPause(videoTagManager) {
    const operatorInstance = getOperatorInstance(videoTagManager);

    if (operatorInstance.isPauseFromSocketExecution) {
        operatorInstance.isPauseFromSocketExecution = false;
        return;
    }

    emitMessageToBackgroundScript({ "tag": tags["socketServerTags"]["pause"] });
}

function onSeek(videoTagManager) {
    const operatorInstance = getOperatorInstance(videoTagManager);

    if (operatorInstance.isSeekFromSocketExecution) {
        operatorInstance.isSeekFromSocketExecution = false;
        return
    };

    emitMessageToBackgroundScript({ "tag": tags["socketServerTags"]["seek"], "extraData": videoTagManager.videoTag.currentTime });
}

function onBuffer(videoTagManager) {
    getOperatorInstance(videoTagManager).wasBuffering = true;
    emitMessageToBackgroundScript({ "tag": tags["socketServerTags"]["pause"] });
}

function onBufferComplete(videoTagManager) {
    if (!getOperatorInstance(videoTagManager).wasBuffering)
        return;

    getOperatorInstance(videoTagManager).wasBuffering = false;
    emitMessageToBackgroundScript({ "tag": tags["socketServerTags"]["play"] });
}

export { onPlay, onPause, onSeek, onBuffer, onBufferComplete };