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

import getCurrentTab from '../utils/getCurrentTab';

export default class TabMonitor {
    //      Instance Attributes
    //  currentTabId;
    //  currentTabUrl;
    //  onMessageBackgroundListener;
    //  mainManagerInstance

    //  onTabUrlChangedListener
    //  onTabRemovedListener

    constructor(mainManagerInstance) {
        this.mainManagerInstance = mainManagerInstance;

        this.onTabUrlChangedListener = (changedTabId, changeInfo, tab) => {
            if (this.currentTabUrl != tab.url) {
                mainManagerInstance.releaseInstances();
            }
        };
        this.onTabRemovedListener = (changedTabId) => {
            if (changedTabId == this.currentTabId) {
                mainManagerInstance.releaseInstances();
            }
        };

        this.initialize();
    }

    async initialize() {
        const currentTab = await getCurrentTab();
        this.currentTabId = currentTab.id;
        this.currentTabUrl = currentTab.url;

        browser.tabs.onUpdated.addListener(this.onTabUrlChangedListener, { "properties": ["title"], "tabId": this.currentTabId });
        browser.tabs.onRemoved.addListener(this.onTabRemovedListener)
    }

    removeListeners() {
        browser.tabs.onUpdated.removeListener(this.onTabUrlChangedListener);
        browser.tabs.onRemoved.removeListener(this.onTabRemovedListener);
    }
}