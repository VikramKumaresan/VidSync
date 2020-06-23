/*
 * 
 * Background script to act to set up main listener and manager.
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

import tags from '../tags';
import MainManager from './mainManager';
import StateManager from './stateManager';

//
//  Initializations
//
const stateManagerInstance = new StateManager();
let mainManagerInstance;

//
//  Listen for messages from content script and pop up script
//
browser.runtime.onMessage.addListener((data) => {

    switch (data["tag"]) {

        //  Get state from browser action script
        case tags["popUpBackground"]["getState"]:
            return Promise.resolve(stateManagerInstance.getState());

        //  Name from browser action script
        case tags["popUpBackground"]["update"]:
            //  Disconnect and release old instances
            if (mainManagerInstance) {
                mainManagerInstance.releaseInstances();
            }

            mainManagerInstance = new MainManager(stateManagerInstance, data["name"], data["url"],);
            stateManagerInstance.setState(tags["states"]["connectingServer"]);
            break;

        //  Synchronize calls from content script
        case tags["socketServerTags"]["pause"]:
        case tags["socketServerTags"]["play"]:
            mainManagerInstance.webSocketManagerInstance.sendMessageToServer(data);
            break;

        case tags["socketServerTags"]["seek"]:
            mainManagerInstance.webSocketManagerInstance.sendMessageToServer({ "tag": data["tag"], "seekTo": data["extraData"] });
            break;

        case tags["socketServerTags"]["getTime"]:
        case tags["socketServerTags"]["getTimeAutoSync"]:
        case tags["socketServerTags"]["updateTime"]:
            mainManagerInstance.webSocketManagerInstance.sendMessageToServer({ "tag": data["tag"], "currentTime": data["extraData"] });
            break;
    }

});