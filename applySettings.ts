import { Website, WebsiteAction } from './src/website';

const applySettings = () => {
    const hostname = window.location.hostname;
    const keysToGet = ['addedWebsites'];

    // Remove any existing grayscale style
    const existingStyle = document.getElementById('dopamine-rehab-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    chrome.storage.sync.get(keysToGet, (items: { [key: string]: any }) => {
        let isSiteGrayscale = false;
        let isSiteClose = false;

        const addedWebsites: Website[] = items.addedWebsites || [];

        for (const site of addedWebsites) {
            const url = site.url;
            if (hostname === url || hostname.endsWith('.' + url)) {
                for (const actionObj of site.actions) {
                    const currentPath = window.location.pathname;
                    const actionPaths = actionObj.paths;

                    const pathMatches = actionPaths.length === 0 ||
                        (actionObj.pathMatch === 'include' && actionPaths.some(p => currentPath.startsWith(p))) ||
                        (actionObj.pathMatch === 'exclude' && !actionPaths.some(p => currentPath.startsWith(p)));

                    const timeMatches = actionObj.alwaysActive || isWithinTime(actionObj);

                    if (timeMatches && pathMatches) {
                        const behavior = actionObj.action.value;
                        if (behavior === 'close') isSiteClose = true;
                        else if (behavior === 'grayscale') isSiteGrayscale = true;
                    }
                }
            }
        }

        if (isSiteClose) {
            chrome.runtime.sendMessage({action: 'closeTab'});
        } else if (isSiteGrayscale) {
            const style = document.createElement('style');
            style.id = 'dopamine-rehab-style';
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
    // JS getDay() starts week from Sunday, we start from Monday, so we need to adjust
    let currentDay = now.getDay();
    currentDay = (currentDay + 6) % 7;

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

// Initial run
applySettings();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === 'urlChanged') {
        applySettings();
    }
});

// Also keep popstate as a fallback for some navigation types
window.addEventListener('popstate', applySettings);
