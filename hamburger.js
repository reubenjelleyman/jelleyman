document.addEventListener('DOMContentLoaded', () => {
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const mainNav = document.getElementById('main-nav');
    const headerTop = document.querySelector('.header-top');
    const sidebar = document.getElementById('sidebar-placeholder');

    // Saved states so closing the hamburger restores what the page scroll set
    let savedHeaderOpacity = null;
    let savedHeaderVisibility = null;
    let savedSidebarOpacity = null;
    let savedSidebarPointerEvents = null;

    if (hamburgerIcon && mainNav) {
        hamburgerIcon.addEventListener('click', () => {
            hamburgerIcon.classList.toggle('open');
            mainNav.classList.toggle('open');

            if (mainNav.classList.contains('open')) {
                // Save whatever the page scroll JS had set, then force visible for the overlay
                if (headerTop) {
                    savedHeaderOpacity = headerTop.style.opacity;
                    savedHeaderVisibility = headerTop.style.visibility;
                    headerTop.style.opacity = '0';
                    headerTop.style.visibility = 'hidden';
                }
                if (sidebar) {
                    savedSidebarOpacity = sidebar.style.opacity;
                    savedSidebarPointerEvents = sidebar.style.pointerEvents;
                    sidebar.style.opacity = '1';
                    sidebar.style.pointerEvents = 'auto';
                }
            } else {
                // Restore exactly what the page scroll JS had set
                if (headerTop) {
                    headerTop.style.opacity = savedHeaderOpacity !== null ? savedHeaderOpacity : '';
                    headerTop.style.visibility = savedHeaderVisibility !== null ? savedHeaderVisibility : '';
                }
                if (sidebar) {
                    sidebar.style.opacity = savedSidebarOpacity !== null ? savedSidebarOpacity : '';
                    sidebar.style.pointerEvents = savedSidebarPointerEvents !== null ? savedSidebarPointerEvents : '';
                }
            }
        });
    }
});
