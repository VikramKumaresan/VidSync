/*
 * 
 * Background script to act as a bridge between various manager classes.
 *
 * 
 *  Why release instances?
 *      The background script lives throughout the browser's lifetime. But if the user closes a tab/window 
 *      or changes the url, the sync no longer can occur. Hence a manual disconnection (And resource freeing) 
 *      is required.    
 *      Else the socket would remain connected for no use.
 * 
 *  syncAllJoin vs syncAll
 *      SyncAllJoin is initiated when a new user joins. This forces all video tags to enter the pause state,
 *      so that all participants, especially the new participant, can be in the same state to begin with. Else
 *      the new participant would be in a different state compared to the others.
 *      SyncAll is called periodically to ensure all participants are within a specified time range as the leader.
 *      Refer the contentScript for exact time range.
 *   
*/

//
//  Initializations
//
let videoTagManagerInstance;
let webSocketManagerInstance;
let tabMonitorInstance;
const stateManagerInstance = new StateManager();

//
//  Listen for messages from background and content scripts
//
browser.runtime.onMessage.addListener((data) => {

    switch (data["tag"]) {

        //  Get state from browser action script
        case tags["popUpBackground"]["getState"]:
            return Promise.resolve(stateManagerInstance.getState());

        //  Name from browser action script
        case tags["popUpBackground"]["update"]:
            //  Disconnect and release old instances
            if (webSocketManagerInstance) {
                releaseOldInstances();
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

//
//  Listen to messages from socketManager and tabMonitor
//
function messageListener(tag, extraData = "") {

    switch (tag) {
        //  Tab monitor messages
        case tags["tabMonitorTags"]["tabClosed"]:
        case tags["tabMonitorTags"]["tabUrlChange"]:
            if (webSocketManagerInstance) {
                releaseOldInstances();
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

//
//  Utility functions
//
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

    tabMonitorInstance.removeListeners();
    tabMonitorInstance = null;

    stateManagerInstance.refreshState();
}