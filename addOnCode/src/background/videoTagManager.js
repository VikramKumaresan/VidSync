class VideoTagManager {

    currentTabId;

    constructor() {
        this.getCurrentTabId();
    }

    async getCurrentTabId() {
        //  Get active tab
        let tabArray = await browser.tabs.query({
            active: true,
            currentWindow: true
        });

        this.currentTabId = tabArray[0].id;
    }

    pauseVideo() {
        this.emitToContentScript(tags["socketServerTags"]["pause"]);
    }

    playVideo() {
        this.emitToContentScript(tags["socketServerTags"]["play"]);
    }

    seekVideo(seekTo) {
        this.emitToContentScript(tags["socketServerTags"]["seek"], seekTo);
    }

    emitToContentScript(tag, data = "") {
        browser.tabs.sendMessage(this.currentTabId, {
            "tag": tag,
            "data": data
        });
    }
}