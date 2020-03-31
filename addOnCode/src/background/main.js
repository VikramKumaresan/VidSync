//  Initializations
const videoTagManagerInstance = new VideoTagManager();
let webSocketManagerInstance;

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Name from browser action script
    if (data["tag"] == tags["popUpBackground"]["nameUpdate"]) {
        webSocketManagerInstance = new WebSocketManager(data["name"], emitMessageToPopupScript);
        webSocketManagerInstance.connectToSocketServer();
        return Promise.resolve({ "result": true });
    }

});

function emitMessageToPopupScript(errorString) {

    //  TODO Update global state

    message = (tag) => {
        try {
            browser.runtime.sendMessage({
                "tag": tag
            });
        }
        catch (e) { }
    }

    if (errorString == tags["error"]["connectionError"]) {
        //  Send error to pop up script [If it exists]
        message(tags["error"]["connectionError"])
    }
    else if (errorString == tags["error"]["connectionClose"]) {
        //  Send close to pop up script [If it exists]
        message(tags["error"]["connectionClose"])
    }
}