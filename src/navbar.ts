export function injectNavbar() {
    const navbarHtml = `
    <nav class="navbar border-bottom py-2 px-3" id="top-navbar">
        <div class="container-fluid">
            <div class="d-flex align-items-center">
                <img src="../icons/icon128.png" alt="Logo" width="32" height="32" class="me-2">
                <h5 class="mb-0 user-select-none text-white fw-bold" id="logo-title">Dopamine Rehab</h5>
            </div>
            <div class="ms-auto d-flex align-items-center">
                <a href="dashboard.html" class="nav-link me-3 ${window.location.pathname.endsWith('dashboard.html') ? 'active' : ''}">Dashboard</a>
                <a href="about.html" class="nav-link ${window.location.pathname.endsWith('about.html') ? 'active' : ''}">About</a>
            </div>
        </div>
    </nav>
    `;

    const body = document.body;
    body.insertAdjacentHTML('afterbegin', navbarHtml);
}
