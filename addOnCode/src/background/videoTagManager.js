/*
 * 
 *  Class to emit messages to the content script, to manipulate video tag.
 *
 *  New videoTagManager object is required for every sync, as the object only monitors the currentTabId.
 *  The currentTabId is used to contact content script in current tab.
 * 
*/

import tags from '../tags';
import getCurrentTab from '../utils/getCurrentTab';

export default class VideoTagManager {
    //  Instance Attributes
    //currentTabId;

    constructor() {
        this.initialize();
    }

    async initialize() {
        const currentTab = await getCurrentTab();
        this.currentTabId = currentTab.id;
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

    getTime(tag) {
        this.emitToContentScript(tag);
    }

    sync(tag, time) {
        this.emitToContentScript(tag, time);
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
}