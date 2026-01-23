interface WebsiteAction {
    action: {
        value: string;
        options: any;
    };
    startTime: string;
    endTime: string;
    days: number[];
    alwaysActive: boolean;
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
                    if (actionObj.alwaysActive || isWithinTime(actionObj)) {
                        const behavior = actionObj.action.value;
                        if (behavior === 'grayscale') isSiteGrayscale = true;
                        else if (behavior === 'close') isSiteClose = true;
                    }
                }
            }
        }

        if (isSiteClose) {
            chrome.runtime.sendMessage({action: 'closeTab'});
        } else if (isSiteGrayscale) {
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

function isWithinTime(actionObj: WebsiteAction) {
    const now = new Date();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentDay = now.getDay();

    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const startMinutes = timeToMinutes(actionObj.startTime);
    const endMinutes = timeToMinutes(actionObj.endTime);
    const isWithinTime = currentMinutes >= startMinutes && currentMinutes < endMinutes;
    const isRightDay = actionObj.days.includes(currentDay);

    return isWithinTime && isRightDay;
}

applySettings();
