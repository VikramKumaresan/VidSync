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

//
//      Message Box
//

//  Create message box
const messageBox = document.createElement("div");
messageBox.id = "messageBox";
messageBox.style = "background-color: #e0e094; width: 15vw; display: inline-block; position: fixed; bottom: 2vh;  right: 2vw; overflow: auto; border-radius: 0.25em; transition: opacity 0.5s ease-in-out; opacity: 0;";
messageBox.innerHTML = "<p id='message' style='margin:1em; font-size: 15px;'>Hello!</p>";

//  Inject message box
document.body.appendChild(messageBox);

const successColor = '#64e986';
const failureColor = '#ff726f';
const infoColor = '#e0e094';

const messageTag = messageBox.firstElementChild;

//  Remove message onTimeout
messageBoxTimeout = window.setTimeout(() => { messageBox.style.opacity = 0; }, 5000);

function displayMessage(message, color) {
    window.clearInterval(messageBoxTimeout);

    messageTag.innerHTML = message;
    messageBox.style.backgroundColor = color;
    messageBox.style.opacity = 1;

    messageBoxTimeout = window.setTimeout(() => { messageBox.style.opacity = 0; }, 5000);
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

        //  Message Display calls
        case tags["error"]["connectionError"]:
            displayMessage(tags["messages"]["cannotConnectServer"], failureColor);
            break;

        case tags["error"]["connectionClose"]:
            displayMessage(tags["messages"]["connectionClosedServer"], failureColor);
            break;

        case tags["webSocketMessages"]["connectionOpen"]:
            displayMessage(tags["messages"]["connectedServer"], successColor);
            break;

        case tags["messages"]["updationServerFailed"]:
            displayMessage(tags["messages"]["updationServerFailed"] + data["data"], failureColor);
            break;

        //  Synchronize calls
        case tags["socketServerTags"]["pause"]:
            //  If not paused (Callback will not be triggered if pause on paused)
            if (!videoTag.paused) {
                isPauseFromSocketExecution = true;
                videoTag.pause();
                displayMessage(tags["messages"]["pause"] + data["name"], infoColor);
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
            displayMessage(tags["messages"]["play"] + data["name"], infoColor);

            break;

        case tags["socketServerTags"]["seek"]:
            isSeekFromSocketExecution = true;
            videoTag.currentTime = data["data"];

            displayMessage(tags["messages"]["seek"] + data["name"], infoColor);
            break;

        case tags["socketServerTags"]["getTime"]:
        case tags["socketServerTags"]["getTimeAutoSync"]:
            sendMessageToBackground(data["tag"], videoTag.currentTime);
            break;


        case tags["socketServerTags"]["syncAllNewJoin"]:

            //  First pauses. Then Syncs

            //  If not paused (Callback will not be triggered if pause on paused)
            if (!videoTag.paused) {
                isPauseFromSocketExecution = true;
                videoTag.pause();
            }

            displayMessage(tags["messages"]["syncAll"], infoColor);

            isSeekFromSocketExecution = true;
            videoTag.currentTime = data["data"];

        case tags["socketServerTags"]["syncAll"]:
            //  Auto sync (Should be within 4 seconds of leader time)
            if (Math.abs(videoTag.currentTime - parseFloat(data["data"])) > 4) {
                displayMessage(tags["messages"]["syncAll"], infoColor);

                isSeekFromSocketExecution = true;
                videoTag.currentTime = data["data"];
            }
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