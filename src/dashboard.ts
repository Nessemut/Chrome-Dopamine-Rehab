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

    let customUrlsList: string[] = [];
    let customSiteSettings: { [url: string]: string } = {};
    let selectedUrl: string | null = null;

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
        chrome.storage.sync.get(['customUrls', 'customSiteSettings'], (items) => {
            if (items.customUrls && Array.isArray(items.customUrls)) {
                customUrlsList = items.customUrls;
            }
            customSiteSettings = items.customSiteSettings || {};
            renderSidebar();

            if (customUrlsList.length > 0 && !selectedUrl) {
                selectSite(customUrlsList[0]);
            }
        });
    }

    function renderSidebar() {
        sidebarLinks.innerHTML = '';
        customUrlsList.forEach(url => {
            const link = document.createElement('a');
            link.className = 'list-group-item list-group-item-action';
            if (url === selectedUrl) link.classList.add('active');
            link.textContent = url;
            link.href = '#';
            link.addEventListener('click', (e) => {
                e.preventDefault();
                selectSite(url);
            });
            sidebarLinks.appendChild(link);
        });
    }

    function selectSite(url: string) {
        selectedUrl = url;
        renderSidebar();
        
        selectedUrlTitle.textContent = url;
        currentSiteDisplay.textContent = url;
        siteActionSelect.value = customSiteSettings[url] || 'none';
        
        configPanel.classList.remove('d-none');
        noSelectionMsg.classList.add('d-none');
    }

    function saveSettings() {
        chrome.storage.sync.set({
            customUrls: customUrlsList,
            customSiteSettings: customSiteSettings
        }, () => {
            status.textContent = 'Settings saved!';
            setTimeout(() => {
                if (status) status.textContent = '';
            }, 2000);
        });
    }

    addCustomUrlBtn.addEventListener('click', () => {
        const url = customUrlInput.value.trim();
        if (url && !customUrlsList.includes(url)) {
            customUrlsList.push(url);
            customUrlInput.value = '';
            renderSidebar();
            selectSite(url);
        }
    });

    siteActionSelect.addEventListener('change', () => {
        if (selectedUrl) {
            customSiteSettings[selectedUrl] = siteActionSelect.value;
            saveSettings();
        }
    });

    removeSiteBtn.addEventListener('click', () => {
        if (selectedUrl) {
            customUrlsList = customUrlsList.filter(u => u !== selectedUrl);
            delete customSiteSettings[selectedUrl];
            selectedUrl = null;
            
            selectedUrlTitle.textContent = 'Select a site';
            configPanel.classList.add('d-none');
            noSelectionMsg.classList.remove('d-none');
            renderSidebar();
        }
    });

    saveBtn.addEventListener('click', () => {
        saveSettings();
    });

    loadSettings();
});
