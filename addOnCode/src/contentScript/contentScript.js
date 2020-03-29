const videoTags = document.getElementsByTagName("video");

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {
    if (data["tag"] == "contentScriptIsVideoTagAccessible") {
        if (videoTags.length != 0) {
            return Promise.resolve({ "result": true })
        }
        return Promise.resolve({ "result": false })
    }
});