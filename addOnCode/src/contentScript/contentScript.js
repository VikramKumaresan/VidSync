/*
 * 
 * Content script to access and manipulate video tag on webpage.
 *
*/

import tags from '../tags';
import { emitMessageToBackgroundScript } from '../utils/emitMessageMethods';
import MessageBox from './messageBox';
import VideoTagManager from './videoTag/videoTagManager';

const messageBoxInstance = new MessageBox();
let videoTagManagerInstance;

//
//  Listen for messages from background scripts
//
browser.runtime.onMessage.addListener((data) => {

    switch (data["tag"]) {

        case tags["popUpContent"]["videoTag"]:
            videoTagManagerInstance = new VideoTagManager();

            return new Promise(async (resolve) => {
                if (!videoTagManagerInstance.getVideoTag())
                    return resolve({ "result": false, "tag": tags["messages"]["noCapturableTags"] });

                else if (!await videoTagManagerInstance.isAutoPlayAllowed())
                    return resolve({ "result": false, "tag": tags["messages"]["noAutoPlay"] });

                else if (!videoTagManagerInstance.isVideoTagReady()) {
                    videoTagManagerInstance.videoTag.play();
                    return resolve({ "result": false, "tag": tags["messages"]["notReadyState"] });
                }

                videoTagManagerInstance.attachVideoTagListeners();
                return resolve({ "result": true, "url": document.URL, tag: "" });
            });

        //  Message Display calls
        case tags["states"]["stateTag"]:
            if (data["stateObj"]["isError"]) {
                messageBoxInstance.displayMessage(data["stateObj"]["message"], messageBoxInstance.getColors()["failureColor"]);
                return;
            }
            messageBoxInstance.displayMessage(data["stateObj"]["message"], messageBoxInstance.getColors()["successColor"]);
            break;

        //  Video tag operation calls
        case tags["socketServerTags"]["pause"]:
            if (!videoTagManagerInstance.videoTag.paused) {
                videoTagManagerInstance.videoTagOperatorInstance.socketPause();
                messageBoxInstance.displayMessage(tags["messages"]["pause"] + data["name"], messageBoxInstance.getColors()["infoColor"]);
            }
            break;

        case tags["socketServerTags"]["play"]:
            if (!videoTagManagerInstance.videoTag.paused)
                return;
            else if (videoTagManagerInstance.isVideoTagBuffering()) {
                emitMessageToBackgroundScript({ "tag": tags["socketServerTags"]["pause"] });
                return;
            }

            videoTagManagerInstance.videoTagOperatorInstance.socketPlay();
            messageBoxInstance.displayMessage(tags["messages"]["play"] + data["name"], messageBoxInstance.getColors()["infoColor"]);
            break;

        case tags["socketServerTags"]["seek"]:
            videoTagManagerInstance.videoTagOperatorInstance.socketSeek(data["data"]);
            messageBoxInstance.displayMessage(tags["messages"]["seek"] + data["name"], messageBoxInstance.getColors()["infoColor"]);
            break;

        //  Video tag sync calls
        case tags["socketServerTags"]["getTime"]:
        case tags["socketServerTags"]["getTimeAutoSync"]:
        case tags["socketServerTags"]["updateTime"]:
            emitMessageToBackgroundScript({ "tag": data["tag"], "extraData": videoTagManagerInstance.videoTag.currentTime });
            break;

        case tags["socketServerTags"]["syncAllNewJoin"]:
            videoTagManagerInstance.videoTagOperatorInstance.socketSyncAllNewJoin(data["data"]);
            messageBoxInstance.displayMessage(tags["messages"]["syncAll"], messageBoxInstance.getColors()["infoColor"]);
            break;

        case tags["socketServerTags"]["syncAll"]:
            if (!videoTagManagerInstance.isWithinTimeRange(data["data"])) {
                messageBoxInstance.displayMessage(tags["messages"]["syncAll"], messageBoxInstance.getColors()["infoColor"]);
                videoTagManagerInstance.videoTagOperatorInstance.socketSeek(data["data"]);
            }
    }
});