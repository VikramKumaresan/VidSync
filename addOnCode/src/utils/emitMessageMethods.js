async function emitToContentScriptInTab(tabId, messageObject) {
    browser.tabs.sendMessage(tabId, messageObject);
}

async function emitMessageToBackgroundScript(messageObject) {
    //  Update background script [If it exists, ex. pop up script]
    try { browser.runtime.sendMessage(messageObject); }
    catch (e) { }
}

export { emitToContentScriptInTab, emitMessageToBackgroundScript };