import { Website } from './website';

export const STORAGE_KEY = 'addedWebsites';

export function loadSettings(): Promise<Website[]> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([STORAGE_KEY], (items) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(items[STORAGE_KEY] || []);
            }
        });
    });
}

export function saveSettings(addedWebsites: Website[]): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set({ [STORAGE_KEY]: addedWebsites }, () => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve();
            }
        });
    });
}
