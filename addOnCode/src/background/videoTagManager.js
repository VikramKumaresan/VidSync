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
import { emitToContentScriptInTab } from "../utils/emitMessageMethods";


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
        emitToContentScriptInTab(this.currentTabId, this.createMessageObject(tags["socketServerTags"]["pause"], "", name));
    }

    playVideo(name) {
        emitToContentScriptInTab(this.currentTabId, this.createMessageObject(tags["socketServerTags"]["play"], "", name));
    }

    seekVideo(seekTo, name) {
        emitToContentScriptInTab(this.currentTabId, this.createMessageObject(tags["socketServerTags"]["seek"], seekTo, name));
    }

    getTime(tag) {
        emitToContentScriptInTab(this.currentTabId, this.createMessageObject(tag));
    }

    sync(tag, time) {
        emitToContentScriptInTab(this.currentTabId, this.createMessageObject(tag, time));
    }

    createMessageObject(tag, data = "", name = "") {
        return {
            "tag": tag,
            "data": data,
            "name": name
        };
    }
}