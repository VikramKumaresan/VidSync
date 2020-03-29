//  Initializations
const videoTagManagerInstance = new VideoTagManager();
let webSocketManagerInstance;

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Name from browser action script
    if (data["tag"] == "popUpName") {
        webSocketManagerInstance = new WebSocketManager(data["name"]);
        return Promise.resolve({ "result": true });
    }

});