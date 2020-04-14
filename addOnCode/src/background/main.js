//  Initializations
let videoTagManagerInstance;
let webSocketManagerInstance;
let tabMonitorInstance;
const stateManagerInstance = new StateManager();

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    switch (data["tag"]) {

        //  Get state from browser action script
        case tags["popUpBackground"]["getState"]:
            return Promise.resolve(stateManagerInstance.getState());

        //  Name from browser action script
        case tags["popUpBackground"]["update"]:
            //  Disconnect and release old instances
            if (webSocketManagerInstance) {
                this.releaseOldInstances();
            }

            videoTagManagerInstance = new VideoTagManager();
            tabMonitorInstance = new TabMonitor(messageListener);
            webSocketManagerInstance = new WebSocketManager(data["name"], data["url"], messageListener);
            webSocketManagerInstance.connectToSocketServer();

            stateManagerInstance.setState(tags["messages"]["connectingServer"]);

            return Promise.resolve({ "result": true });

        //  Synchronize calls from content script
        case tags["socketServerTags"]["pause"]:
        case tags["socketServerTags"]["play"]:
            webSocketManagerInstance.sendMessageToServer(data);
            break;

        case tags["socketServerTags"]["seek"]:
            webSocketManagerInstance.sendMessageToServer({ "tag": data["tag"], "seekTo": data["extraData"] });
            break;

        case tags["socketServerTags"]["getTime"]:
        case tags["socketServerTags"]["getTimeAutoSync"]:
        case tags["socketServerTags"]["updateTime"]:
            webSocketManagerInstance.sendMessageToServer({ "tag": data["tag"], "currentTime": data["extraData"] });
            break;
    }

});

//  From socketManager and tabMonitor
function messageListener(tag, extraData = "") {

    switch (tag) {
        //  Tab monitor messages
        case tags["tabMonitorTags"]["tabClosed"]:
        case tags["tabMonitorTags"]["tabUrlChange"]:
            if (webSocketManagerInstance) {
                this.releaseOldInstances();
            }
            break;

        //  Synchronize messages from socket
        case tags["socketServerTags"]["pause"]:
            videoTagManagerInstance.pauseVideo(extraData);
            break;

        case tags["socketServerTags"]["play"]:
            videoTagManagerInstance.playVideo(extraData);
            break;

        case tags["socketServerTags"]["seek"]:
            videoTagManagerInstance.seekVideo(extraData["seekTo"], extraData["name"]);
            break;

        case tags["socketServerTags"]["getTime"]:
        case tags["socketServerTags"]["getTimeAutoSync"]:
        case tags["socketServerTags"]["updateTime"]:
            videoTagManagerInstance.getTime(tag);
            break;

        case tags["socketServerTags"]["syncAll"]:
            videoTagManagerInstance.sync(extraData);
            break;

        case tags["socketServerTags"]["syncAllNewJoin"]:
            videoTagManagerInstance.syncNewJoin(extraData);
            break;

        //  Other messages from socket
        default:
            emitMessageToPopupScript(tag, extraData)
            videoTagManagerInstance.displayMessage(tag, extraData);
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
    tabMonitorInstance = null;
    stateManagerInstance.refreshState();
}