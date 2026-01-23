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

document.addEventListener('DOMContentLoaded', () => {
    const customUrlInput = document.getElementById('custom-url-input') as HTMLInputElement;
    const addCustomUrlBtn = document.getElementById('add-custom-url-btn') as HTMLButtonElement;
    const sidebarLinks = document.getElementById('sidebar-links') as HTMLDivElement;
    const selectedUrlTitle = document.getElementById('selected-url-title') as HTMLHeadingElement;
    const currentSiteDisplay = document.getElementById('current-site-display') as HTMLSpanElement;
    const siteActionSelect = document.getElementById('site-action-select') as HTMLSelectElement;
    const removeSiteBtn = document.getElementById('remove-site-btn') as HTMLButtonElement;
    const configPanel = document.getElementById('config-panel') as HTMLDivElement;
    const noSelectionMsg = document.getElementById('no-selection-msg') as HTMLDivElement;
    const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
    const status = document.getElementById('status') as HTMLSpanElement;

    let addedWebsites: Website[] = [];
    let selectedWebsite: Website | null = null;
    let isLoaded = false;

    const SITE_ACTIONS = [
        {value: 'none', text: 'Nothing'},
        {
            value: 'grayscale',
            text: 'Grayscale',
            hint: 'Grayscale reduces visual stimulation, preventing unnecessary dopamine spikes and making it easier for your brain to focus calmly instead of chasing novelty.'
        },
        {value: 'redirect', text: 'Redirect to another page'},
        {value: 'close', text: 'Force Close'}
    ];

    SITE_ACTIONS.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.text;
        siteActionSelect.appendChild(option);
    });

    function loadSettings() {
        chrome.storage.sync.get(['addedWebsites'], (items) => {
            if (items.addedWebsites) {
                addedWebsites = items.addedWebsites;
            }

            isLoaded = true;
            renderSidebar();

            if (addedWebsites.length > 0) {
                if (selectedWebsite) {
                    const found = addedWebsites.find(s => s.url === selectedWebsite!.url);
                    if (found) {
                        selectedWebsite = found;
                        selectSite(selectedWebsite.url);
                    } else {
                        selectSite(addedWebsites[0].url);
                    }
                } else {
                    selectSite(addedWebsites[0].url);
                }
            }
        });
    }

    function renderSidebar() {
        sidebarLinks.innerHTML = '';
        addedWebsites.forEach(site => {
            const link = document.createElement('a');
            link.className = 'list-group-item list-group-item-action d-flex align-items-center';
            if (selectedWebsite && site.url === selectedWebsite.url) link.classList.add('active');
            
            if (site.favicon) {
                const img = document.createElement('img');
                img.src = site.favicon;
                img.width = 16;
                img.height = 16;
                img.className = 'me-2';
                link.appendChild(img);
            }

            const span = document.createElement('span');
            span.textContent = site.url;
            link.appendChild(span);

            link.href = '#';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                selectSite(site.url);
            });
            sidebarLinks.appendChild(link);
        });
    }

    function selectSite(url: string) {
        selectedWebsite = addedWebsites.find(s => s.url === url) || null;
        renderSidebar();
        
        if (selectedWebsite) {
            selectedUrlTitle.textContent = selectedWebsite.url;
            if (selectedWebsite.favicon) {
                const img = document.createElement('img');
                img.src = selectedWebsite.favicon;
                img.width = 24;
                img.height = 24;
                img.className = 'me-2 mb-1';
                selectedUrlTitle.prepend(img);
            }
            renderActions();
            
            configPanel.classList.remove('d-none');
            noSelectionMsg.classList.add('d-none');
        } else {
            configPanel.classList.add('d-none');
            noSelectionMsg.classList.remove('d-none');
        }
    }

    function saveSettings() {
        chrome.storage.sync.set({
            addedWebsites: addedWebsites
        }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error saving settings:', chrome.runtime.lastError);
                status.textContent = 'Error saving!';
                status.className = 'status badge bg-danger text-white me-2';
            } else {
                status.textContent = 'Settings saved!';
                status.className = 'status badge bg-info text-dark me-2';
            }
            setTimeout(() => {
                if (status) status.textContent = '';
            }, 2000);
        });
    }

    addCustomUrlBtn.addEventListener('click', () => {
        if (!isLoaded) return;
        const url = customUrlInput.value.trim();
        if (url) {
            const existing = addedWebsites.find(s => s.url === url);
            if (!existing) {
                const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
                const newSite: Website = {
                    url,
                    favicon,
                    actions: []
                };
                addedWebsites.push(newSite);
                customUrlInput.value = '';
                selectSite(url);
                saveSettings();
            } else {
                selectSite(url);
            }
        }
    });

    siteActionSelect.addEventListener('change', () => {
        if (selectedWebsite) {
            const newValue = siteActionSelect.value;
            if (newValue === 'none') {
                selectedWebsite.actions = [];
            } else {
                selectedWebsite.actions = [{
                    action: {
                        value: newValue,
                        options: {}
                    }
                }];
            }
            saveSettings();
        }
    });

    removeSiteBtn.addEventListener('click', () => {
        if (selectedWebsite) {
            addedWebsites = addedWebsites.filter(s => s.url !== selectedWebsite!.url);
            selectedWebsite = null;
            
            selectedUrlTitle.textContent = 'Select a site';
            configPanel.classList.add('d-none');
            noSelectionMsg.classList.remove('d-none');
            renderSidebar();
            saveSettings();
        }
    });

    saveBtn.addEventListener('click', () => {
        saveSettings();
    });

    loadSettings();
});
