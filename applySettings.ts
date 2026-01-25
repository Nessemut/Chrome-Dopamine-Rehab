import { Website, WebsiteAction } from './src/website';

let currentObserver: MutationObserver | null = null;

const applySettings = () => {
    const hostname = window.location.hostname;
    const keysToGet = ['addedWebsites'];

    if (currentObserver) {
        currentObserver.disconnect();
        currentObserver = null;
    }

    const existingStyle = document.getElementById('dopamine-rehab-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    chrome.storage.sync.get(keysToGet, (items: { [key: string]: any }) => {
        let isSiteGrayscale = false;
        let isSiteClose = false;
        let selectorsToRemove: string[] = [];

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
                        else if (behavior === 'removeHtmlSelectors' && actionObj.action.options.htmlSelectorsToRemove) {
                            selectorsToRemove.push(...actionObj.action.options.htmlSelectorsToRemove);
                        }
                    }
                }
            }
        }

        if (isSiteClose) {
            chrome.runtime.sendMessage({action: 'closeTab'});
        }

        if (isSiteGrayscale) {
            const style = document.createElement('style');
            style.id = 'dopamine-rehab-style';
            style.innerHTML = `
                html {
                    filter: grayscale(100%) !important;
                }
            `;
            document.documentElement.appendChild(style);
        }

        if (selectorsToRemove.length !== 0) {
            removeElements(selectorsToRemove);
            currentObserver = new MutationObserver(() => {
                removeElements(selectorsToRemove);
            });
            currentObserver.observe(document.documentElement, {
                childList: true,
                subtree: true
            });
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

const removeElements = (selectors: string[]) => {
    for (const selector of selectors) {
        if (!selector) continue;
        let elements: NodeListOf<Element>;
        if (selector.startsWith('.') || selector.startsWith('#')) {
            elements = document.querySelectorAll(selector);
        } else {
            elements = document.querySelectorAll(`.${selector}, #${selector}`);
        }
        elements.forEach(el => el.remove());
    }
};

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
