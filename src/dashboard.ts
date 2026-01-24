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

document.addEventListener('DOMContentLoaded', () => {
    const customUrlInput = document.getElementById('custom-url-input') as HTMLInputElement;
    const addCustomUrlBtn = document.getElementById('add-custom-url-btn') as HTMLButtonElement;
    const sidebarLinks = document.getElementById('sidebar-links') as HTMLDivElement;
    const selectedUrlTitle = document.getElementById('selected-url-title') as HTMLHeadingElement;
    const actionsContainer = document.getElementById('actions-container') as HTMLDivElement;
    const addActionBtn = document.getElementById('add-action-btn') as HTMLButtonElement;
    const removeSiteBtn = document.getElementById('remove-site-btn') as HTMLButtonElement;
    const configPanel = document.getElementById('config-panel') as HTMLDivElement;
    const noSelectionMsg = document.getElementById('no-selection-msg') as HTMLDivElement;
    const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
    const status = document.getElementById('status') as HTMLSpanElement;

    let addedWebsites: Website[] = [];
    let selectedWebsite: Website | null = null;
    let isLoaded = false;

    const SITE_ACTIONS = [
        {value: 'grayscale', text: 'Grayscale'},
        {value: 'close', text: 'Force Close'}
    ];

    const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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

    function renderActions() {
        if (!selectedWebsite) return;
        actionsContainer.innerHTML = '';
        actionsContainer.classList.add('row', 'g-4', 'ps-3');

        addActionBtn.disabled = selectedWebsite.actions.some(a => a.alwaysActive);

        selectedWebsite.actions.forEach((action, index) => {
            const colWrapper = document.createElement('div');
            colWrapper.className = 'col-5';

            const actionRow = document.createElement('div');
            actionRow.className = 'action-row card text-dark p-2 bg-secondary h-100';
            let daysHtml = '';
            DAYS_OF_WEEK.forEach((day, i) => {
                const checked = action.days.includes(i) ? 'checked' : '';
                const disabled = action.alwaysActive ? 'disabled' : '';
                daysHtml += `
                    <div class="form-check form-check-inline">
                        <input class="form-check-input day-check" type="checkbox" value="${i}" id="day-${index}-${i}" ${checked} ${disabled}>
                        <label class="form-check-label small" for="day-${index}-${i}">${day}</label>
                    </div>
                `;
            });

            actionRow.innerHTML = `
                <div class="row g-2 align-items-center mb-4">
                    <div class="col-md-3">
                        <select class="form-select form-select-sm action-select">
                            ${SITE_ACTIONS.map(opt => `<option value="${opt.value}" ${action.action.value === opt.value ? 'selected' : ''}>${opt.text}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <div class="row g-2">
                            <div class="col-6">
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text">From</span>
                                    <input type="time" class="form-control start-time time-selector-input" value="${action.startTime}" ${action.alwaysActive ? 'disabled' : ''}>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text">To</span>
                                    <input type="time" class="form-control end-time time-selector-input" value="${action.endTime}" ${action.alwaysActive ? 'disabled' : ''}>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="days-container">
                    ${daysHtml}
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="form-check pt-1">
                        <input class="form-check-input always-active-check" type="checkbox" id="always-${index}" ${action.alwaysActive ? 'checked' : ''}>
                        <label class="form-check-label small" for="always-${index}">Always active</label>
                    </div>
                    <button class="btn btn-outline-danger btn-sm remove-action-btn">Delete action</button>
                </div>
            `;

            const actionSelect = actionRow.querySelector('.action-select') as HTMLSelectElement;
            actionSelect.addEventListener('change', () => {
                action.action.value = actionSelect.value;
                saveSettings();
            });

            const alwaysActiveCheck = actionRow.querySelector('.always-active-check') as HTMLInputElement;
            alwaysActiveCheck.addEventListener('change', () => {
                action.alwaysActive = alwaysActiveCheck.checked;
                renderActions();
                saveSettings();
            });

            const startTimeInput = actionRow.querySelector('.start-time') as HTMLInputElement;
            startTimeInput.addEventListener('change', () => {
                action.startTime = startTimeInput.value;
                saveSettings();
            });

            const endTimeInput = actionRow.querySelector('.end-time') as HTMLInputElement;
            endTimeInput.addEventListener('change', () => {
                action.endTime = endTimeInput.value;
                saveSettings();
            });

            const dayChecks = actionRow.querySelectorAll('.day-check') as NodeListOf<HTMLInputElement>;
            dayChecks.forEach(check => {
                check.addEventListener('change', () => {
                    const day = parseInt(check.value);
                    let newDays = [...action.days];
                    if (check.checked) {
                        newDays.push(day);
                    } else {
                        newDays = newDays.filter(d => d !== day);
                    }

                    action.days = newDays;
                    saveSettings();
                });
            });

            const removeActionBtn = actionRow.querySelector('.remove-action-btn') as HTMLButtonElement;
            removeActionBtn.addEventListener('click', () => {
                selectedWebsite!.actions.splice(index, 1);
                renderActions();
                saveSettings();
            });

            colWrapper.appendChild(actionRow);
            actionsContainer.appendChild(colWrapper);
        });
    }

    addActionBtn.addEventListener('click', () => {
        if (selectedWebsite) {
            //We default timings to usual core work schedules
            const newAction: WebsiteAction = {
                action: {value: 'grayscale', options: {}},
                startTime: '09:00',
                endTime: '18:00',
                days: [0, 1, 2, 3, 4],
                alwaysActive: false
            };

            selectedWebsite.actions.push(newAction);
            renderActions();
            saveSettings();
        }
    });

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

    removeSiteBtn.addEventListener('click', () => {
        //TODO: ask for confirmation with a popup
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

    addCustomUrlBtn.addEventListener('click', () => {
        if (!isLoaded) return;
        //TODO: validate URL format
        const url = customUrlInput.value.trim();
        if (url) {
            const existing = addedWebsites.find(s => s.url === url);
            if (!existing) {
                const favicon = `https://www.google.com/s2/favicons?domain=${url}&sz=32`;
                const newSite: Website = {
                    url,
                    favicon,
                    actions: [
                        {
                            action: {value: 'grayscale', options: {}},
                            startTime: '00:00',
                            endTime: '23:59',
                            days: [0, 1, 2, 3, 4, 5, 6],
                            alwaysActive: true
                        }
                    ]
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

    saveBtn.addEventListener('click', () => {
        saveSettings();
    });

    loadSettings();
});
