window.addEventListener('DOMContentLoaded', () => {
    checkVideoTagAvailable();

    document.getElementById("updateButton").addEventListener("click", sendNameToBackground);
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
    //  Connected to server
    else if (data["tag"] == tags["webSocketMessages"]["connectionOpen"]) {
        showMessageInPopUp(tags["messages"]["connectedServer"]);
    }

});

async function sendNameToBackground() {
    let result = await browser.runtime.sendMessage({
        "tag": tags["popUpBackground"]["nameUpdate"],
        "name": document.getElementById("name").value
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

async function checkVideoTagAvailable() {

    //  Get active tab
    let tabArray = await browser.tabs.query({
        active: true,
        currentWindow: true
    });

    let result;

    //  Check if content script already loaded
    try {

        //  Check if videoTag accessible
        result = await browser.tabs.sendMessage(tabArray[0].id, {
            "tag": tags["popUpContent"]["videoTagAccess"]
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

        //  Check if videoTag accessible
        result = await browser.tabs.sendMessage(tabArray[0].id, {
            "tag": tags["popUpContent"]["videoTagAccess"]
        });
    }

    if (!result["result"]) {
        showMessageInPopUp(tags["messages"]["noCapturableTags"])
    }
}