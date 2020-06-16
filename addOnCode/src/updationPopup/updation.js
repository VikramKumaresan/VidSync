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

let videoUrl;

window.addEventListener('DOMContentLoaded', () => {
    initialize();
});

async function initialize() {
    let state = await getState();

    if (state["isError"] || (state["stateMessage"].length != 0)) {
        showMessageInPopUp(state["stateMessage"]);
        return;
    }

    checkVideoTagStatus();
}

async function getState() {
    let state = await browser.runtime.sendMessage({
        "tag": tags["popUpBackground"]["getState"]
    });
    return Promise.resolve(state);
}

//  Listen to messages from background script
browser.runtime.onMessage.addListener((data) => {

    switch (data["tag"]) {
        case tags["states"]["stateTag"]:
            showMessageInPopUp(data["stateObj"]["message"]);
            break;
    }

});

function sendDataToBackground() {
    browser.runtime.sendMessage({
        "tag": tags["popUpBackground"]["update"],
        "name": document.getElementById("name").value,
        "url": videoUrl
    });
}

//  Hides form and displays message
function showMessageInPopUp(message) {
    const messageTag = document.getElementById("errorMessage");
    messageTag.textContent = message;
    messageTag.style.display = "block";

    document.getElementById("form").style.display = "none";
}

async function checkVideoTagStatus() {

    //  Get active tab
    let tabArray = await browser.tabs.query({
        active: true,
        currentWindow: true
    });

    let result;

    //  Check if content script already loaded
    try {

        //  Check if videoTag ready
        result = await browser.tabs.sendMessage(tabArray[0].id, {
            "tag": tags["popUpContent"]["videoTag"]
        });

    } catch (e) {
        console.log(e);

        //  Inject content script
        await browser.tabs.executeScript({
            file: "../../builds/contentScript.min.js"
        });

        //  Check if videoTag ready
        result = await browser.tabs.sendMessage(tabArray[0].id, {
            "tag": tags["popUpContent"]["videoTag"]
        });
    }

    if (!result["result"]) {
        showMessageInPopUp(result["tag"]);
    }
    else {
        //  Reload popUp
        if (("tag" in result) && (result["tag"] == tags["popUpContent"]["reloadPopUp"])) {
            location.reload();
            return;
        }

        videoUrl = result["url"];
        document.getElementById("updateButton").addEventListener("click", sendDataToBackground);
    }
}