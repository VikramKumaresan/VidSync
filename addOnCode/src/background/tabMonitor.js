/*
 * 
 *  Class to monitor whether a tab's url is changed or is closed. In both cases the sync is no longer possible.
 * 
 *  New tabMonitor object is required for every sync, as the object only monitors the currentTabId.
 * 
 *  Why remove listeners?
 *      Even if the old object is released, the listeners are still bound to that object (Till GC cleans it)
 *      and it triggers false events.
 * 
*/

import tags from '../tags';

export default class TabMonitor {
    //      Instance Attributes
    //  currentTabId;
    //  currentTabUrl;
    //  onMessageBackgroundListener;

    //  onTabUrlChangedListener
    //  onTabRemovedListener

    constructor(onMessageBackgroundListener) {
        this.onMessageBackgroundListener = onMessageBackgroundListener;

        this.onTabUrlChangedListener = (changedTabId, changeInfo, tab) => {
            if (this.currentTabUrl != tab.url) {
                this.onMessageBackgroundListener(tags["tabMonitorTags"]["tabUrlChange"]);
            }
        };
        this.onTabRemovedListener = (changedTabId) => {
            if (changedTabId == this.currentTabId) {
                this.onMessageBackgroundListener(tags["tabMonitorTags"]["tabClosed"]);
            }
        };

        this.initialize();
    }

    async initialize() {
        await this.getCurrentTabId();
        browser.tabs.onUpdated.addListener(this.onTabUrlChangedListener, { "properties": ["title"], "tabId": this.currentTabId });
        browser.tabs.onRemoved.addListener(this.onTabRemovedListener)
    }

    async getCurrentTabId() {
        //  Get active tab
        let tabArray = await browser.tabs.query({
            active: true,
            currentWindow: true
        });

        this.currentTabId = tabArray[0].id;
        this.currentTabUrl = tabArray[0].url;
    }

    removeListeners() {
        browser.tabs.onUpdated.removeListener(this.onTabUrlChangedListener);
        browser.tabs.onRemoved.removeListener(this.onTabRemovedListener);
    }
}