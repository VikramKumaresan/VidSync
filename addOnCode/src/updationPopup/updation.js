window.addEventListener('DOMContentLoaded', () => {
    checkVideoTagAvailable();
});

function videoTagResult(result) {
    if (!result) {
        //  Display error div + Hide form
        document.getElementById("errorMessage").style.display = "block";
        document.getElementById("form").style.display = "none";
    }
}

async function checkVideoTagAvailable() {

    // TODO check if script already injected
    await browser.tabs.executeScript({
        file: "../contentScript/contentScript.js"
    });

    let tabArray = await browser.tabs.query({
        active: true,
        currentWindow: true
    });

    let result = await browser.tabs.sendMessage(tabArray[0].id, {
        "tag": "contentScriptIsVideoTagAccessible"
    });

    videoTagResult(result["result"]);
}