import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../common.css';
import { injectNavbar } from '../navbar';
import { loadSettings, saveSettings } from '../storage';
import { Website } from '../website';

const normalizeUrl = (url: string): string => {
    let normalized = url.trim().toLowerCase();
    if (normalized.includes('://')) {
        try {
            normalized = new URL(normalized).hostname;
        } catch (e) {
            // Ignore invalid URLs, keep as is
        }
    }
    return normalized;
};

const isSubdomain = (parent: string, child: string): boolean => {
    if (parent === child) return true;
    return child.endsWith('.' + parent);
};

const loadConfigFromFile = async (filename: string): Promise<Website[]> => {
    try {
        const response = await fetch(chrome.runtime.getURL(`src/common-configs/${filename}`));
        if (!response.ok) {
            throw new Error(`Failed to load config: ${response.statusText}`);
        }
        return await response.json();
    } catch (err) {
        console.error('Error loading config from file:', err);
        throw err;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();

    const infoModalElement = document.getElementById('infoModal');
    const infoModalBody = document.getElementById('infoModalBody');
    let infoModal: Modal | null = null;
    if (infoModalElement) {
        infoModal = new Modal(infoModalElement);
    }

    const showInfoModal = (message: string) => {
        if (infoModal && infoModalBody) {
            infoModalBody.textContent = message;
            infoModal.show();
        } else {
            alert(message);
        }
    };

    const installConfig = async (settings: Website[]) => {
        try {
            const existingSettings = await loadSettings();
            let merged = [...existingSettings];

            settings.forEach(newSite => {
                const newUrl = normalizeUrl(newSite.url);
                let foundMatch = false;

                for (let i = 0; i < merged.length; i++) {
                    const existingUrl = normalizeUrl(merged[i].url);

                    if (isSubdomain(newUrl, existingUrl)) {
                        merged[i] = {
                            ...merged[i], 
                            url: newUrl, 
                            favicon: newSite.favicon || merged[i].favicon,
                            actions: [...merged[i].actions, ...newSite.actions] 
                        };
                        foundMatch = true;
                    } else if (isSubdomain(existingUrl, newUrl)) {
                        merged[i] = {
                            ...merged[i], 
                            favicon: newSite.favicon || merged[i].favicon,
                            actions: [...merged[i].actions, ...newSite.actions] 
                        };
                        foundMatch = true;
                    }
                }

                if (!foundMatch) {
                    merged.push({ ...newSite, url: newUrl });
                } else {
                    const uniqueMerged: Website[] = [];
                    const seenUrls = new Set<string>();
                    for (const site of merged) {
                        if (!seenUrls.has(site.url)) {
                            uniqueMerged.push(site);
                            seenUrls.add(site.url);
                        } else {
                            const existing = uniqueMerged.find(s => s.url === site.url);
                            if (existing) {
                                existing.actions = [...existing.actions, ...site.actions];
                            }
                        }
                    }
                    merged = uniqueMerged;
                }
            });

            await saveSettings(merged);
            showInfoModal('Configuration installed successfully!');
        } catch (err) {
            console.error('Failed to install configuration:', err);
            showInfoModal('Failed to install configuration.');
        }
    };


    //TODO: this is a hardcoded test, all config will be generalized
    const youtubeBtn = document.getElementById('install-youtube-clean');
    if (youtubeBtn) {
        youtubeBtn.addEventListener('click', async () => {
            try {
                const config = await loadConfigFromFile('youtube.json');
                await installConfig(config);
            } catch (err) {
                showInfoModal('Failed to load YouTube configuration.');
            }
        });
    }
});
