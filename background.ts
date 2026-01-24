chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "src/dashboard.html" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeTab' && sender.tab) {
        if (sender.tab.id !== undefined) {
            chrome.tabs.remove(sender.tab.id);
        }
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        chrome.tabs.sendMessage(tabId, { action: 'urlChanged', url: changeInfo.url }).catch(err => {
            // Ignore errors when sending messages to tabs that don't have the content script
        });
    }
});
