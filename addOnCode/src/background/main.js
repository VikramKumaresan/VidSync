//  Initializations
const videoTagManagerInstance = new VideoTagManager();
let webSocketManagerInstance;

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Name from browser action script
    if (data["tag"] == "popUpName") {
        webSocketManagerInstance = new WebSocketManager(data["name"], emitErrorToPopupScript);
        webSocketManagerInstance.connectToSocketServer();
        return Promise.resolve({ "result": true });
    }

});

function emitErrorToPopupScript(errorString) {

    //  TODO Update global state

    if (errorString == "connectionError") {
        //  Send error to pop up script [If it exists]
        try {
            browser.runtime.sendMessage({
                "tag": "backgroundScriptConnectionError"
            });
        }
        catch (e) { }
    }
}