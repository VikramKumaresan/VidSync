async function emitToContentScriptInTab(tabId, messageObject) {
    browser.tabs.sendMessage(tabId, messageObject);
}

async function emitMessageToBackgroundScript(messageObject) {
    browser.runtime.sendMessage(messageObject);
}

export { emitToContentScriptInTab, emitMessageToBackgroundScript };