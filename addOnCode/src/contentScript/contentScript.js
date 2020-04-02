const videoTag = document.getElementsByTagName("video")[0];
let isAutoPlayAllowed = false;

//  Check if auto play allowed
if (videoTag) {
    checkIfAutoPlayEnabled = async () => {
        try {
            await videoTag.play();
            isAutoPlayAllowed = true;
            videoTag.pause();
        } catch (e) { }
    }
    checkIfAutoPlayEnabled();
}


//  Listen for messages
browser.runtime.onMessage.addListener((data) => {

    //  Check if video tag present/accessible
    if (data["tag"] == tags["popUpContent"]["videoTag"]) {
        if (!videoTag) {
            return Promise.resolve({ "result": false, "tag": tags["messages"]["noCapturableTags"] });
        }

        if (!isAutoPlayAllowed) {
            return Promise.resolve({ "result": false, "tag": tags["messages"]["noAutoPlay"] });
        }
        else if (videoTag.readyState == 0) {
            videoTag.play();
            return Promise.resolve({ "result": false, "tag": tags["messages"]["notReadyState"] });
        }

        return Promise.resolve({ "result": true, "url": document.URL });
    }
    //  Synchronize calls
    else if (data["tag"] == tags["socketServerTags"]["pause"]) {
        videoTag.pause();
    }
    else if (data["tag"] == tags["socketServerTags"]["play"]) {
        console.log("PLay Called")
        videoTag.play();
    }
    else if (data["tag"] == tags["socketServerTags"]["seek"]) {
        videoTag.currentTime = data["data"];
    }

});

//  Fired on tab close/url change
window.addEventListener("beforeunload", () => {
    browser.runtime.sendMessage({
        "tag": tags["contentBackground"]["windowClose"]
    });
})