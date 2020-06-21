/*
 * 
 *  Browser action script to show pop up to start syncing process.
 *  
 *          Script Behaviour
 *  Fetch State -> If state was in error, it shows error message. Else if successfully syncing it shows message. 
 *  Else if in start state -> Get video tag url. This calls the content script and checks if video tag present
 *                              ,autoPlay enabled and if video has gotten meta data. If any of these is has not
 *                              happened, error displayed.
 *  Else, script gets videoUrl -> Emit to bakcground script to update server.                            
 *
*/

import tags from '../tags';
import { emitMessageToBackgroundScript } from "../utils/emitMessageMethods";
import getCurrentTabId from "../utils/getCurrentTab";
import PopUpManager from "./popUpManager";

let videoUrl, popUpManagerInstance;

window.addEventListener('DOMContentLoaded', () => {
    initialize();
});

async function initialize() {
    popUpManagerInstance = new PopUpManager(sendUpdateDataToBackground);

    const state = await getState();

    if (state["stateMessage"].length != 0) {
        popUpManagerInstance.showMessage(state["stateMessage"]);
        return;
    }
    getVideoUrl();
}

async function getState() {
    return await browser.runtime.sendMessage({ "tag": tags["popUpBackground"]["getState"] });
}

//  Listen to messages from background script
browser.runtime.onMessage.addListener((data) => {

    switch (data["tag"]) {
        case tags["states"]["stateTag"]:
            popUpManagerInstance.showMessage(data["stateObj"]["message"]);
            break;
    }

});

function sendUpdateDataToBackground() {
    emitMessageToBackgroundScript({
        "tag": tags["popUpBackground"]["update"],
        "name": popUpManagerInstance.getName(),
        "url": videoUrl
    })
    popUpManagerInstance.showMessage(tags["states"]["connectingServer"]["message"]);
}

async function getVideoUrl() {
    const currentTab = await getCurrentTabId();

    await loadContentScriptIfNeeded(currentTab.id);

    const result = await getVideoUrlFromContentScript(currentTab.id);

    if (!result["result"]) {
        popUpManagerInstance.showMessage(result["tag"]);
    }
    else if (result["tag"] == tags["popUpContent"]["reloadPopUp"]) {
        location.reload();
    }
    else {
        videoUrl = result["url"];
        popUpManagerInstance.attachUpdateButtonListener();
    }
}

async function loadContentScriptIfNeeded(tabId) {
    if (! await isContentScriptLoaded(tabId)) {
        await injectContentScript();
    }
}

async function isContentScriptLoaded(tabId) {
    try {
        await getVideoUrlFromContentScript(tabId);
        return true;
    } catch (e) { return false; }
}

async function getVideoUrlFromContentScript(tabId) {
    return await browser.tabs.sendMessage(tabId, { "tag": tags["popUpContent"]["videoTag"] });
}

async function injectContentScript() {
    await browser.tabs.executeScript({ file: "../../builds/contentScript.min.js" });
}