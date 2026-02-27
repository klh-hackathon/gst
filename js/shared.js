export function initSidebar(activePage) {
    console.log('Initializing sidebar for:', activePage);
    const sidebar = document.getElementById('sidebar');

    if (!sidebar) {
        console.error('Sidebar container #sidebar not found');
        return;
    }

    const navItems = [
        { name: 'Dashboard', href: 'dashboard.html', icon: '📊' },
        { name: 'Analytics', href: 'analytics.html', icon: '📈' },
        { name: 'Settings', href: 'settings.html', icon: '⚙️' }
    ];

    let navHTML = navItems.map(item => {
        // Simple string match for active state
        const isActive = item.href.includes(activePage) ? 'active' : '';

        return `
            <a href="${item.href}" class="nav-link ${isActive}">
                <span style="font-size:18px">${item.icon}</span> 
                <span style="font-weight:500">${item.name}</span>
            </a>
        `;
    }).join('');

    sidebar.innerHTML = `
        <div class="sidebar-logo" style="margin-bottom:40px; text-align:left; padding-left:15px">
            <div style="font-size:10px; color:var(--text-dim); letter-spacing:2px; font-weight:700">CORE SYSTEM</div>
            <div style="font-size:22px; color:var(--accent-light); font-weight:800; letter-spacing:-1px">GST RECON</div>
        </div>
        
        <nav style="flex:1; display:flex; flex-direction:column; gap:5px">
            ${navHTML}
        </nav>
        
        <div style="padding-top:20px; border-top:1px solid rgba(255,255,255,0.05)">
            <button class="btn w-full" id="logout-btn"
                    style="background:rgba(255,255,255,0.03); box-shadow:none; border:1px solid rgba(255,255,255,0.05); color:var(--text-dim); transition: 0.3s;">
                LOGOUT
            </button>
        </div>
    `;

    // Re-bind logout logic inside the sidebar
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onmouseenter = () => logoutBtn.style.background = 'rgba(244, 63, 94, 0.1)';
        logoutBtn.onmouseleave = () => logoutBtn.style.background = 'rgba(255,255,255,0.03)';
    }
}

export function formatINR(value) {
    const num = Number(value || 0);
    return '₹' + num.toLocaleString('en-IN');
}

export function riskBadge(score) {
    let badgeType = 'success';
    if (score > 40) badgeType = 'warning';
    if (score > 70) badgeType = 'danger';
    return `<span class="badge badge-${badgeType}">${score}%</span>`;
}
