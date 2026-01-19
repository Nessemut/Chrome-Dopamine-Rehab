interface CustomSiteSettings {
    [url: string]: string;
}

const applySettings = () => {
    const hostname = window.location.hostname;
    const keysToGet = ['customSiteSettings'];

    chrome.storage.sync.get(keysToGet, (items: { [key: string]: any }) => {
        let isSiteBW = false;
        let isSiteClose = false;

        const customSiteSettings: CustomSiteSettings = items.customSiteSettings || {};

        for (const [url, behavior] of Object.entries(customSiteSettings)) {
            // Exact domain match or subdomain match
            if (hostname === url || hostname.endsWith('.' + url)) {
                if (behavior === 'bw') isSiteBW = true;
                if (behavior === 'close') isSiteClose = true;
            }
        }

        if (isSiteClose) {
            chrome.runtime.sendMessage({ action: 'closeTab' });
            return;
        }

        else if (isSiteBW) {
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
