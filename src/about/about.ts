import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import '../common.css';
import { injectNavbar } from '../navbar';
import { loadSettings } from '../storage';

document.addEventListener('DOMContentLoaded', () => {
    injectNavbar();

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
                alert('Failed to download settings.');
            }
        });
    }
});
