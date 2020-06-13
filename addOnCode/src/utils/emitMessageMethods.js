async function emitToContentScriptInTab(tabId, tag, data = "", name = "") {
    browser.tabs.sendMessage(tabId, {
        "tag": tag,
        "data": data,
        "name": name
    });
}

async function emitMessageToBackgroundScript(tag, extraData = "") {
    //  Update background script [If it exists, ex. pop up script]
    try {
        browser.runtime.sendMessage({
            "tag": tag,
            "extra": extraData
        });
    }
    catch (e) { }
}

export { emitToContentScriptInTab, emitMessageToBackgroundScript };