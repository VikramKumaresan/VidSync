window.addEventListener('DOMContentLoaded', () => {
    checkVideoTagAvailable();

    document.getElementById("updateButton").addEventListener("click", sendNameToBackground);
});

//  Listen to messages
browser.runtime.onMessage.addListener((data) => {

    //  Error from background script
    if (data["tag"] == "backgroundScriptConnectionError") {
        showMessageInPopUp("Cannot cannect to server!");
    }

});

async function sendNameToBackground() {
    let result = await browser.runtime.sendMessage({
        "tag": "popUpName",
        "name": document.getElementById("name").value
    });

    if (result["result"]) {
        showMessageInPopUp("Connecting to server...")
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
            "tag": "contentScriptIsVideoTagAccessible"
        });

    } catch (e) {
        console.log(e);

        //  Inject content script
        await browser.tabs.executeScript({
            file: "../contentScript/contentScript.js"
        });

        //  Check if videoTag accessible
        result = await browser.tabs.sendMessage(tabArray[0].id, {
            "tag": "contentScriptIsVideoTagAccessible"
        });
    }

    if (!result["result"]) {
        showMessageInPopUp("No capturable video sources available!")
    }
}