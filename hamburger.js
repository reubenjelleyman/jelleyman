document.addEventListener('DOMContentLoaded', () => {
    const hamburgerIcon = document.getElementById('hamburger-icon');
    const mainNav = document.getElementById('main-nav');
    const headerTop = document.querySelector('.header-top'); // Assuming this contains the title

    if (hamburgerIcon && mainNav) {
        hamburgerIcon.addEventListener('click', () => {
            hamburgerIcon.classList.toggle('open');
            mainNav.classList.toggle('open');

            // Toggle visibility of the main title
            if (headerTop) {
                if (mainNav.classList.contains('open')) {
                    headerTop.style.opacity = '0';
                    headerTop.style.visibility = 'hidden';
                } else {
                    // Only show if screen is large enough (i.e., not in the <500px breakpoint when menu is closed)
                    // This requires checking the media query in JS, or CSS handles it automatically.
                    // For now, let CSS handle the default hidden state when menu is closed in small screens.
                    // The header.css already sets display: none for <499px when menu is not open. 
                    headerTop.style.opacity = '';
                    headerTop.style.visibility = '';
                }
            }
        });
    }
});
