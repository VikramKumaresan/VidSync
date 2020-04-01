//  Initializations
const videoTagManagerInstance = new VideoTagManager();
let webSocketManagerInstance;

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Name from browser action script
    if (data["tag"] == tags["popUpBackground"]["update"]) {

        //  Disconnect and release old instance
        if (webSocketManagerInstance) {
            webSocketManagerInstance.disconnectFromSocketServer();
            webSocketManagerInstance = null;
        }

        webSocketManagerInstance = new WebSocketManager(data["name"], data["url"], emitMessageToPopupScript);
        webSocketManagerInstance.connectToSocketServer();
        return Promise.resolve({ "result": true });
    }
    else if (data["tag"] == tags["contentBackground"]["windowClose"]) {
        //  Tab changed url/closed
        if (webSocketManagerInstance) {
            webSocketManagerInstance.disconnectFromSocketServer();
            webSocketManagerInstance = null;
        }
    }

});

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