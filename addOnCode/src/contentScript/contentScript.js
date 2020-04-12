const videoTag = document.getElementsByTagName("video")[0];

let isAutoPlayAllowed = false;

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

//  Synchronize Call Flags
let isPlayFromSocketExecution = false;
let isPauseFromSocketExecution = false;
let isSeekFromSocketExecution = false;
let wasBuffering = false;


//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    switch (data["tag"]) {

        //  Check if video tag present/accessible
        case tags["popUpContent"]["videoTag"]:
            if (!videoTag) {
                return Promise.resolve({ "result": false, "tag": tags["messages"]["noCapturableTags"] });
            }
            else if (!isAutoPlayAllowed) {

                //  Recheck if autoPlay not enabled
                return new Promise(async (resolve) => {
                    try {
                        await videoTag.play();
                        isAutoPlayAllowed = true;
                        videoTag.pause();

                        attachListenersToVideoTag();

                        return resolve({ "result": true, "tag": tags["popUpContent"]["reloadPopUp"] })
                    } catch (e) {
                        return resolve({ "result": false, "tag": tags["messages"]["noAutoPlay"] })
                    }
                });

            }
            else if (videoTag.readyState == videoTag.HAVE_NOTHING) {
                videoTag.play();
                return Promise.resolve({ "result": false, "tag": tags["messages"]["notReadyState"] });
            }

            return Promise.resolve({ "result": true, "url": document.URL });

        //  Synchronize calls
        case tags["socketServerTags"]["pause"]:
            //  If not paused (Callback will not be triggered if pause on paused)
            if (!videoTag.paused) {
                isPauseFromSocketExecution = true;
                videoTag.pause();
            }
            break;

        case tags["socketServerTags"]["play"]:
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
            break;

        case tags["socketServerTags"]["seek"]:
            isSeekFromSocketExecution = true;
            videoTag.currentTime = data["data"];
            break;

        case tags["socketServerTags"]["getTime"]:
            sendMessageToBackground(tags["socketServerTags"]["getTime"], videoTag.currentTime);
            break;

        case tags["socketServerTags"]["syncAll"]:
            //  First pauses. Then Syncs

            //  If not paused (Callback will not be triggered if pause on paused)
            if (!videoTag.paused) {
                isPauseFromSocketExecution = true;
                videoTag.pause();
            }

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