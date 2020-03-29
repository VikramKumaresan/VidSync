let nameSubmitButton = null;

window.addEventListener('DOMContentLoaded', () => {
    checkVideoTagAvailable();

    nameSubmitButton = document.getElementById("updateButton");
    nameSubmitButton.addEventListener("click", sendNameToBackground);
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

    //  Check if script already loaded
    try {

        //  Check if videoTag accessible
        result = await browser.tabs.sendMessage(tabArray[0].id, {
            "tag": "contentScriptIsVideoTagAccessible"
        });

    } catch (e) {
        console.log(e);

        //  Inject script
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