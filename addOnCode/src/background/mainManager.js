/*
*
*    Main manager class to act as a bridge between other classes.
*
*/

import VideoTagManager from './videoTagManager';
import WebSocketManager from './webSocketManager';
import TabMonitor from './tabMonitor';

export default class MainManager {

    //      Instance Attributes
    //  videoTagManagerInstance;
    //  webSocketManagerInstance;
    //  tabMonitorInstance;
    //  stateManagerInstance

    constructor(stateManagerInstance, name, url) {
        this.videoTagManagerInstance = new VideoTagManager();;
        this.webSocketManagerInstance = new WebSocketManager(name, url, this);
        this.tabMonitorInstance = new TabMonitor(this);
        this.stateManagerInstance = stateManagerInstance;

        this.webSocketManagerInstance.connectToSocketServer();
    }

    releaseInstances() {
        this.webSocketManagerInstance.disconnectFromSocketServer();
        this.tabMonitorInstance.removeListeners();
        this.stateManagerInstance.refreshState();
    }

    async emitMessageToPopupScript(tag, extraData = "") {
        //  Update pop up script [If it exists]
        try {
            browser.runtime.sendMessage({
                "tag": tag,
                "extra": extraData
            });
        }
        catch (e) { }
    }

    displayMessage(tag, message) {
        this.emitMessageToPopupScript(tag, message);
        this.videoTagManagerInstance.displayMessage(tag, message);
    }
}