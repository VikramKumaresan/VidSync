//  Initializations
let videoTagManagerInstance;
let webSocketManagerInstance;
const stateManagerInstance = new StateManager();

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Get state from browser action script
    if (data["tag"] == tags["popUpBackground"]["getState"]) {
        return Promise.resolve(stateManagerInstance.getState());
    }
    //  Name from browser action script
    else if (data["tag"] == tags["popUpBackground"]["update"]) {

        //  Disconnect and release old instances
        if (webSocketManagerInstance) {
            this.releaseOldInstances();
        }

        videoTagManagerInstance = new VideoTagManager();
        webSocketManagerInstance = new WebSocketManager(data["name"], data["url"], messageListener);
        webSocketManagerInstance.connectToSocketServer();

        stateManagerInstance.setState(tags["messages"]["connectingServer"]);

        return Promise.resolve({ "result": true });
    }
    else if (data["tag"] == tags["contentBackground"]["windowClose"]) {
        //  Tab changed url/closed
        if (webSocketManagerInstance) {
            this.releaseOldInstances();
        }
    }
    //  Synchronize calls from content script
    else if ((data["tag"] == tags["socketServerTags"]["pause"]) || (data["tag"] == tags["socketServerTags"]["play"])) {
        webSocketManagerInstance.sendMessageToServer(data);
    }
    else if (data["tag"] == tags["socketServerTags"]["seek"]) {
        webSocketManagerInstance.sendMessageToServer({ "tag": data["tag"], "seekTo": data["extraData"] });
    }
    else if (data["tag"] == tags["socketServerTags"]["getTime"]) {
        webSocketManagerInstance.sendMessageToServer({ "tag": data["tag"], "currentTime": data["extraData"] });
    }
});

//  From socketManager
function messageListener(tag, extraData = "") {
    //  Synchronize messages from socket
    if (tag == tags["socketServerTags"]["pause"]) {
        videoTagManagerInstance.pauseVideo();
    }
    else if (tag == tags["socketServerTags"]["play"]) {
        videoTagManagerInstance.playVideo();
    }
    else if (tag == tags["socketServerTags"]["seek"]) {
        videoTagManagerInstance.seekVideo(extraData["seekTo"]);
    }
    else if (tag == tags["socketServerTags"]["getTime"]) {
        videoTagManagerInstance.getTime();
    }
    else if (tag == tags["socketServerTags"]["syncAll"]) {
        videoTagManagerInstance.sync(extraData);
    }
    //  Other messages from socket
    else {
        emitMessageToPopupScript(tag, extraData)
    }
}

async function emitMessageToPopupScript(tag, extraData = "") {
    //  Update pop up script [If it exists]
    try {
        browser.runtime.sendMessage({
            "tag": tag,
            "extra": extraData
        });
    }
    catch (e) { }
    finally {
        stateManagerInstance.setState(tag, extraData);
    }
}

function releaseOldInstances() {
    webSocketManagerInstance.disconnectFromSocketServer();
    webSocketManagerInstance = null;
    videoTagManagerInstance = null;
    stateManagerInstance.refreshState();
}