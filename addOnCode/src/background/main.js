//  Initializations
let videoTagManagerInstance;
let webSocketManagerInstance;

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Name from browser action script
    if (data["tag"] == tags["popUpBackground"]["update"]) {

        //  Disconnect and release old instances
        if (webSocketManagerInstance) {
            this.releaseOldInstances();
        }

        videoTagManagerInstance = new VideoTagManager();
        webSocketManagerInstance = new WebSocketManager(data["name"], data["url"], messageListener);
        webSocketManagerInstance.connectToSocketServer();
        return Promise.resolve({ "result": true });
    }
    else if (data["tag"] == tags["contentBackground"]["windowClose"]) {
        //  Tab changed url/closed
        if (webSocketManagerInstance) {
            this.releaseOldInstances();
        }
    }

});

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
    //  Other messages from socket
    else {
        emitMessageToPopupScript(tag, extraData)
    }
}

function emitMessageToPopupScript(tag, extraData = "") {
    //  Update pop up script [If it exists]
    try {
        browser.runtime.sendMessage({
            "tag": tag,
            "extra": extraData
        });
    }
    catch (e) { }
}

function releaseOldInstances() {
    webSocketManagerInstance.disconnectFromSocketServer();
    webSocketManagerInstance = null;
    videoTagManagerInstance = null;
}