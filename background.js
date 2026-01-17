chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: "src/dashboard.html" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closeTab' && sender.tab) {
        chrome.tabs.remove(sender.tab.id);
    }
});