const videoTag = document.getElementsByTagName("video")[0];
let isAutoPlayAllowed = false;

//  Synchronize Call Flags
let isPlayFromSocketExecution = false;
let isPauseFromSocketExecution = false;
let isSeekFromSocketExecution = false;
let wasBuffering = false;

//  Check if auto play allowed
if (videoTag) {
    checkIfAutoPlayEnabled = async () => {
        try {
            await videoTag.play();
            isAutoPlayAllowed = true;
            videoTag.pause();

            attachListenersToVideoTag();
        } catch (e) { }
    }
    checkIfAutoPlayEnabled();
}


//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Check if video tag present/accessible
    if (data["tag"] == tags["popUpContent"]["videoTag"]) {
        if (!videoTag) {
            return Promise.resolve({ "result": false, "tag": tags["messages"]["noCapturableTags"] });
        }

        if (!isAutoPlayAllowed) {
            return Promise.resolve({ "result": false, "tag": tags["messages"]["noAutoPlay"] });
        }
        else if (videoTag.readyState == videoTag.HAVE_NOTHING) {
            videoTag.play();
            return Promise.resolve({ "result": false, "tag": tags["messages"]["notReadyState"] });
        }

        return Promise.resolve({ "result": true, "url": document.URL });
    }
    //  Synchronize calls
    else if (data["tag"] == tags["socketServerTags"]["pause"]) {
        //  Already paused (Callback will not be triggered)
        if (videoTag.paused) {
            return;
        }
        isPauseFromSocketExecution = true;
        videoTag.pause();
    }
    else if (data["tag"] == tags["socketServerTags"]["play"]) {
        //  Video buffering
        if (videoTag.readyState < videoTag.HAVE_FUTURE_DATA) {
            sendMessageToBackground(tags["socketServerTags"]["pause"]);
            return;
        }
        //  Already playing (Callback will not be triggered)
        else if (!videoTag.paused) {
            return;
        }
        isPlayFromSocketExecution = true;
        videoTag.play();
    }
    else if (data["tag"] == tags["socketServerTags"]["seek"]) {
        isSeekFromSocketExecution = true;
        videoTag.currentTime = data["data"];
    }

});

//  Fired on tab close/url change
window.addEventListener("beforeunload", () => {
    sendMessageToBackground(tags["contentBackground"]["windowClose"]);
})

function sendMessageToBackground(tag, extraData = "") {
    browser.runtime.sendMessage({
        "tag": tag,
        "extraData": extraData
    });
}

function attachListenersToVideoTag() {

    videoTag.onplay = () => {
        if (isPlayFromSocketExecution) {
            isPlayFromSocketExecution = false;
            return;
        }
        else if (videoTag.readyState < videoTag.HAVE_FUTURE_DATA) {
            return;
        }
        sendMessageToBackground(tags["socketServerTags"]["play"]);
    }
    videoTag.onpause = () => {
        if (isPauseFromSocketExecution) {
            isPauseFromSocketExecution = false;
            return;
        }
        sendMessageToBackground(tags["socketServerTags"]["pause"]);
    }
    videoTag.onseeking = () => {
        if (isSeekFromSocketExecution) {
            isSeekFromSocketExecution = false;
            return;
        }
        sendMessageToBackground(tags["socketServerTags"]["seek"], videoTag.currentTime);
    }

    //  When buffering starts
    videoTag.onwaiting = () => {
        wasBuffering = true;
        sendMessageToBackground(tags["socketServerTags"]["pause"]);
    }
    //  When buffering ends (And the video was in play mode)
    videoTag.onplaying = () => {
        if (!wasBuffering) {
            return;
        }
        wasBuffering = false;
        sendMessageToBackground(tags["socketServerTags"]["play"]);
    }
}