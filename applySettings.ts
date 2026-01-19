interface WebsiteAction {
    action: {
        value: string;
        options: any;
    };
}

interface Website {
    url: string;
    favicon: string;
    actions: WebsiteAction[];
}

const applySettings = () => {
    const hostname = window.location.hostname;
    const keysToGet = ['addedWebsites'];

    chrome.storage.sync.get(keysToGet, (items: { [key: string]: any }) => {
        let isSiteGrayscale = false;
        let isSiteClose = false;

        const addedWebsites: Website[] = items.addedWebsites || [];

        for (const site of addedWebsites) {
            const url = site.url;
            if (hostname === url || hostname.endsWith('.' + url)) {
                for (const actionObj of site.actions) {
                    const behavior = actionObj.action.value;
                    if (behavior === 'grayscale') isSiteGrayscale = true;
                    if (behavior === 'close') isSiteClose = true;
                }
            }
        }

        if (isSiteClose) {
            chrome.runtime.sendMessage({ action: 'closeTab' });
            return;
        }

        else if (isSiteGrayscale) {
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
