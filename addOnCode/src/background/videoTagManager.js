/*
 * 
 *  Class to emit messages to the content script, to manipulate video tag.
 *
 *  New videoTagManager object is required for every sync, as the object only monitors the currentTabId.
 *  The currentTabId is used to contact content script in current tab.
 * 
*/

class VideoTagManager {
    //  Instance Attributes
    //currentTabId;

    constructor() {
        this.getCurrentTabId();
    }

    //  Video operation calls
    pauseVideo(name) {
        this.emitToContentScript(tags["socketServerTags"]["pause"], "", name);
    }

    playVideo(name) {
        this.emitToContentScript(tags["socketServerTags"]["play"], "", name);
    }

    seekVideo(seekTo, name) {
        this.emitToContentScript(tags["socketServerTags"]["seek"], seekTo, name);
    }

    //  Sync calls
    //  getTime -         Triggered when new participant joins [Sync causes pause to all to match states]
    //  getTimeAutoSync - Triggered by auto server sync [Sync doesn't pause as states already matched]
    getTime(tag) {
        this.emitToContentScript(tag);
    }

    sync(time) {
        this.emitToContentScript(tags["socketServerTags"]["syncAll"], time);
    }

    syncNewJoin(time) {
        this.emitToContentScript(tags["socketServerTags"]["syncAllNewJoin"], time);
    }

    //
    //  Utility functions
    //
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

    async getCurrentTabId() {
        //  Get active tab
        let tabArray = await browser.tabs.query({
            active: true,
            currentWindow: true
        });

        this.currentTabId = tabArray[0].id;
    }
}