const videoTag = document.getElementsByTagName("video")[0];

//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Check if video tag present/accessible
    if (data["tag"] == tags["popUpContent"]["videoTag"]) {
        if (!videoTag) {
            return Promise.resolve({ "result": false, "tag": tags["messages"]["noCapturableTags"] });
        }

        if (videoTag.readyState == 0) {
            videoTag.play();
            return Promise.resolve({ "result": false, "tag": tags["messages"]["notReadyState"] });
        }

        return Promise.resolve({ "result": true, "url": document.URL });
    }

});

//  Fired on tab close/url change
window.addEventListener("beforeunload", () => {
    browser.runtime.sendMessage({
        "tag": tags["contentBackground"]["windowClose"]
    });
})