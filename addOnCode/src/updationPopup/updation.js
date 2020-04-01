let videoUrl;

window.addEventListener('DOMContentLoaded', () => {
    checkVideoTagStatus();

    document.getElementById("updateButton").addEventListener("click", sendDataToBackground);
});

//  Listen to messages
browser.runtime.onMessage.addListener((data) => {

    //  Error from background script
    if (data["tag"] == tags["error"]["connectionError"]) {
        showMessageInPopUp(tags["messages"]["cannotConnectServer"]);
    }
    //  Close from background script
    else if (data["tag"] == tags["error"]["connectionClose"]) {
        showMessageInPopUp(tags["messages"]["connectionClosedServer"]);
    }
    //  Connected to server from background script
    else if (data["tag"] == tags["webSocketMessages"]["connectionOpen"]) {
        showMessageInPopUp(tags["messages"]["connectedServer"]);
    }
    //  Updation failed from background script
    else if (data["tag"] == tags["messages"]["updationServerFailed"]) {
        showMessageInPopUp(tags["messages"]["updationServerFailed"] + data["extra"]);
    }

});

async function sendDataToBackground() {
    let result = await browser.runtime.sendMessage({
        "tag": tags["popUpBackground"]["update"],
        "name": document.getElementById("name").value,
        "url": videoUrl
    });

    if (result["result"]) {
        showMessageInPopUp(tags["messages"]["connectingServer"]);
    }
}

//  Hides form and displays message
function showMessageInPopUp(message) {
    const messageTag = document.getElementById("errorMessage");
    messageTag.innerHTML = message;
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

        //  Inject tags.js
        await browser.tabs.executeScript({
            file: "../tags.js"
        });

        //  Inject content script
        await browser.tabs.executeScript({
            file: "../contentScript/contentScript.js"
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
        videoUrl = result["url"];
    }
}