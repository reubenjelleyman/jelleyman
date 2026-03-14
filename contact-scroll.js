document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body.body-contact');
    if (!body) return; 

    const background = document.getElementById('contact-background');
    const middleSection = document.getElementById('middle-section');
    const header = document.querySelector('.contact-title');
    const iconBanner = document.querySelector('.icon-banner');
    const sidebar = document.getElementById('sidebar-placeholder');
    const footer = document.querySelector('.footer');
    const scrollArrow = document.getElementById('scroll-arrow');
    const scrollArrowUp = document.getElementById('scroll-arrow-up');

    let scrollY = 0;
    let isAnimating = false;
    let snapTimeout = null;
    const viewportHeight = window.innerHeight;

    const transitionDuration = viewportHeight * 1.8;
    const maxScroll = transitionDuration; 

    // Auto-scroll if on contact.html
    if (window.location.pathname.includes('contact.html')) {
        scrollY = transitionDuration;
    }

    let currentSection = window.location.pathname.includes('contact.html') ? 'contact' : 'index';

    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    function updateVisuals() {
        // --- Update URL based on scroll position ---
        if (scrollY < transitionDuration / 2 && currentSection !== 'index') {
            currentSection = 'index';
            window.history.replaceState(null, '', 'index.html');
        } else if (scrollY >= transitionDuration / 2 && currentSection !== 'contact') {
            currentSection = 'contact';
            window.history.replaceState(null, '', 'contact.html');
        }

        // --- Arrow Visibility ---
        if (scrollArrow) {
            if (scrollY < 50) {
                scrollArrow.classList.add('visible');
            } else {
                scrollArrow.classList.remove('visible');
            }
        }

        if (scrollArrowUp) {
            if (scrollY >= transitionDuration - 50) {
                scrollArrowUp.classList.add('visible');
            } else {
                scrollArrowUp.classList.remove('visible');
            }
        }

        // --- Phase 1: Header -> Black -> Background -> Black -> Middle Section ---
        if (scrollY <= transitionDuration) {
            const progress = scrollY / transitionDuration;

            // Header fade out (first third)
            const headerProgress = Math.min(1, progress * 3);
            if (header) {
                header.style.opacity = 1 - easeInOutCubic(headerProgress);
                header.style.pointerEvents = header.style.opacity < 0.1 ? 'none' : 'auto';
                header.style.visibility = header.style.opacity < 0.01 ? 'hidden' : 'visible';
            }

            // Banner fade out along with header
            if (iconBanner) {
                iconBanner.style.opacity = 1 - easeInOutCubic(headerProgress);
                iconBanner.style.pointerEvents = iconBanner.style.opacity < 0.1 ? 'none' : 'auto';
                iconBanner.style.visibility = iconBanner.style.opacity < 0.01 ? 'hidden' : 'visible';
            }

            // Background fade out (middle third)
            const bgProgress = Math.max(0, (progress - 1/3) * 3);
            background.style.opacity = 1 - easeInOutCubic(Math.min(1, bgProgress));
            background.style.transform = `translateY(-${easeInOutCubic(Math.min(1, bgProgress)) * 20}vh)`;

            // Middle section fade in (last third)
            const msProgress = Math.max(0, (progress - 2/3) * 3);
            middleSection.style.opacity = easeInOutCubic(Math.min(1, msProgress));
            middleSection.style.visibility = msProgress < 0.01 ? 'hidden' : 'visible';

            if (sidebar) sidebar.style.opacity = 1; 
            if (footer) footer.style.opacity = 1; 
        }
        // --- Phase 2: Middle section fully visible ---
        else if (scrollY > transitionDuration) {
            background.style.opacity = 0;
            middleSection.style.opacity = 1;
            middleSection.style.visibility = 'visible';
            if (header) {
                header.style.opacity = 0;
                header.style.pointerEvents = 'none';
                header.style.visibility = 'hidden';
            }
            if (iconBanner) {
                iconBanner.style.opacity = 0;
                iconBanner.style.pointerEvents = 'none';
                iconBanner.style.visibility = 'hidden';
            }
            if (sidebar) sidebar.style.opacity = 1;
            if (footer) footer.style.opacity = 1;
        }

        // --- Final check for pointer events ---
        if (middleSection.style.opacity > 0.1) {
            middleSection.style.pointerEvents = 'auto';
        } else {
            middleSection.style.pointerEvents = 'none';
        }
    }

    window.addEventListener('wheel', (event) => {
        event.preventDefault();
        
        if (isAnimating) return; // Prevent interference during arrow click animations

        const sensitivity = 2.0; // Make scrolling much easier on trackpads
        scrollY += event.deltaY * sensitivity;
        scrollY = Math.max(0, Math.min(maxScroll, scrollY));
        updateVisuals();

        // Auto-snap to nearest section after scrolling stops
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
            const thresholds = [0, maxScroll];
            let closest = thresholds[0];
            let minDiff = Math.abs(scrollY - closest);

            for (let i = 1; i < thresholds.length; i++) {
                const diff = Math.abs(scrollY - thresholds[i]);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = thresholds[i];
                }
            }
            
            // If we are not already exactly at a threshold, snap to the closest one
            if (minDiff > 1) { 
                smoothScrollTo(closest);
            }
        }, 150);
    }, { passive: false });

    // Scroll down by clicking arrow
    if (scrollArrow) {
        scrollArrow.addEventListener('click', () => {
            smoothScrollTo(transitionDuration);
        });
    }

    // Scroll up by clicking arrow
    if (scrollArrowUp) {
        scrollArrowUp.addEventListener('click', () => {
            smoothScrollTo(0);
        });
    }

    function smoothScrollTo(targetScrollY) {
        if (isAnimating) return;
        isAnimating = true;

        const startY = scrollY;
        const startTime = performance.now();
        const duration = 800; // ms

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);
            
            scrollY = startY + (targetScrollY - startY) * easeProgress;
            updateVisuals();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                scrollY = targetScrollY;
                updateVisuals();
                isAnimating = false;
            }
        }
        requestAnimationFrame(animate);
    }

    // Keyboard navigation
    window.addEventListener('keydown', (event) => {
        if (isAnimating) return;
        if (event.key === 'PageDown' || event.key === 'ArrowDown') {
            event.preventDefault();
            smoothScrollTo(transitionDuration);
        } else if (event.key === 'PageUp' || event.key === 'ArrowUp') {
            event.preventDefault();
            smoothScrollTo(0);
        }
    });
    
    updateVisuals();
});