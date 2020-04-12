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

    pauseVideo(name) {
        this.emitToContentScript(tags["socketServerTags"]["pause"], "", name);
    }

    playVideo(name) {
        this.emitToContentScript(tags["socketServerTags"]["play"], "", name);
    }

    seekVideo(seekTo, name) {
        this.emitToContentScript(tags["socketServerTags"]["seek"], seekTo, name);
    }

    getTime() {
        this.emitToContentScript(tags["socketServerTags"]["getTime"]);
    }

    sync(time) {
        this.emitToContentScript(tags["socketServerTags"]["syncAll"], time);
    }

    displayMessage(tag, extraData) {
        this.emitToContentScript(tag, extraData)
    }

    emitToContentScript(tag, data = "", name = "") {
        browser.tabs.sendMessage(this.currentTabId, {
            "tag": tag,
            "data": data,
            "name": name
        });
    }
}