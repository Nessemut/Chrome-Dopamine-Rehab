const applySettings = () => {
    const hostname = window.location.hostname;
    const siteSettings = {}[hostname];
    const keysToGet = ['customSiteSettings'];

    if (siteSettings) {
        keysToGet.push(siteSettings.behavior);
    }

    chrome.storage.sync.get(keysToGet, (items) => {
        let isSiteBW = false;
        let isSiteClose = false;

        if (siteSettings) {
            const behavior = items[siteSettings.behavior];
            if (behavior === 'bw') isSiteBW = true;
            if (behavior === 'close') isSiteClose = true;
        }

        if (items.customSiteSettings) {
            for (const [url, behavior] of Object.entries(items.customSiteSettings)) {
                // Exact domain match or subdomain match
                if (hostname === url || hostname.endsWith('.' + url)) {
                    if (behavior === 'bw') isSiteBW = true;
                    if (behavior === 'close') isSiteClose = true;
                }
            }
        }

        if (isSiteClose) {
            chrome.runtime.sendMessage({ action: 'closeTab' });
            return;
        }

        if (isSiteBW) {
            const style = document.createElement('style');
            style.innerHTML = `
                html {
                    filter: grayscale(100%) !important;
                }
            `;
            document.documentElement.appendChild(style);
        }
    });
};

applySettings();