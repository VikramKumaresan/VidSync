class TabMonitor {
    currentTabId;
    currentTabUrl;

    constructor(onMessageBackgroundListener) {
        this.getCurrentTabId();

        //  Set up listeners
        browser.tabs.onUpdated.addListener((changedTabId, changeInfo, tab) => {
            console.log(tab.url);
            if (changedTabId != this.currentTabId) {
                return;
            }

            //  tab.url may be undefined
            if (tab.url && !this.currentTabUrl) {
                this.currentTabUrl = tab.url;
                return;
            }

            if (this.currentTabUrl != tab.url) {
                onMessageBackgroundListener(tags["tabMonitorTags"]["tabUrlChange"]);
            }
        });

        browser.tabs.onRemoved.addListener((changedTabId) => {
            if (changedTabId == this.currentTabId) {
                onMessageBackgroundListener(tags["tabMonitorTags"]["tabClosed"]);
            }
        })
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