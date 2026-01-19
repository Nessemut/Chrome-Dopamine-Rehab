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
