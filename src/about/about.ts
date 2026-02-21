import { Modal } from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../common.css';
import { injectNavbar } from '../navbar';
import { loadSettings, saveSettings } from '../storage';
import { Website } from '../website';

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

    const uploadConfirmModalElement = document.getElementById('uploadConfirmModal');
    let uploadConfirmModal: Modal | null = null;
    if (uploadConfirmModalElement) {
        uploadConfirmModal = new Modal(uploadConfirmModalElement);
    }

    const mergeBtn = document.getElementById('merge-settings-btn');
    const replaceBtn = document.getElementById('replace-settings-btn');
    let pendingSettings: Website[] | null = null;

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

    const performUpload = async (settings: Website[], merge: boolean) => {
        try {
            if (merge) {
                const existingSettings = await loadSettings();
                let merged = [...existingSettings];

                settings.forEach(newSite => {
                    const newUrl = normalizeUrl(newSite.url);
                    let foundMatch = false;

                    for (let i = 0; i < merged.length; i++) {
                        const existingUrl = normalizeUrl(merged[i].url);

                        if (isSubdomain(newUrl, existingUrl)) {
                            // newUrl is less restrictive (e.g., facebook.com vs app.facebook.com)
                            // or they are the same.
                            // Merge actions and use the less restrictive URL
                            merged[i] = { 
                                ...merged[i], 
                                url: newUrl, 
                                favicon: newSite.favicon || merged[i].favicon,
                                actions: [...merged[i].actions, ...newSite.actions] 
                            };
                            foundMatch = true;
                        } else if (isSubdomain(existingUrl, newUrl)) {
                            // existingUrl is less restrictive
                            // Merge actions and keep the less restrictive URL
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
                        // After merging, we might have duplicate URLs in the 'merged' array 
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
                showInfoModal('Settings merged successfully!');
            } else {
                await saveSettings(settings);
                showInfoModal('Settings replaced successfully!');
            }
            if (uploadConfirmModal) uploadConfirmModal.hide();
        } catch (err) {
            console.error('Failed to upload settings:', err);
            showInfoModal('Failed to save settings.');
        }
    };

    if (mergeBtn) {
        mergeBtn.addEventListener('click', () => {
            if (pendingSettings) performUpload(pendingSettings, true);
        });
    }

    if (replaceBtn) {
        replaceBtn.addEventListener('click', () => {
            if (pendingSettings) performUpload(pendingSettings, false);
        });
    }

    const downloadBtn = document.getElementById('download-settings') as HTMLButtonElement;
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            try {
                const settings = await loadSettings();
                const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'dopamine-rehab-settings.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Failed to download settings:', err);
                showInfoModal('Failed to download settings.');
            }
        });
    }

    const uploadBtn = document.getElementById('upload-settings') as HTMLButtonElement;
    const uploadInput = document.getElementById('upload-settings-input') as HTMLInputElement;

    if (uploadBtn && uploadInput) {
        uploadBtn.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadInput.addEventListener('change', async (event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files.length > 0) {
                const file = target.files[0];
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const content = e.target?.result as string;
                        const settings = JSON.parse(content);
                        if (Array.isArray(settings) && (settings.length === 0 || (settings[0].url !== undefined && settings[0].actions !== undefined))) {
                            pendingSettings = settings;
                            if (uploadConfirmModal) {
                                uploadConfirmModal.show();
                            } else {
                                // Fallback to simple replace if modal fails
                                await saveSettings(settings);
                                showInfoModal('Settings uploaded successfully!');
                            }
                            target.value = '';
                        } else {
                            showInfoModal('Invalid settings file format.');
                        }
                    } catch (err) {
                        console.error('Failed to upload settings:', err);
                        showInfoModal('Failed to parse settings file.');
                    }
                };
                reader.readAsText(file);
            }
        });
    }
});
