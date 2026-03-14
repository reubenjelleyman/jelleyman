document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body.body-index');
    if (!body) return; 

    const staticBackground = document.getElementById('static-background');
    const montageContainer = document.querySelector('.background-montage');
    const middleSection = document.getElementById('middle-section');
    const headerTop = document.querySelector('.header-top');
    const headerBottom = document.querySelector('.header-bottom');
    const footer = document.querySelector('.footer');
    const scrollArrow = document.getElementById('scroll-arrow');
    const scrollArrowUp = document.getElementById('scroll-arrow-up');

    let scrollY = 0;
    let isAnimating = false;
    let snapTimeout = null;
    const viewportHeight = window.innerHeight;

    const transitionDuration = viewportHeight * 1.8; // Duration to transition to middle section
    const maxScroll = transitionDuration; // Only two sections for now

    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    function updateVisuals() {
        // --- Arrow Visibility ---
        if (scrollArrow) {
            if (scrollY < 50) { // Increased threshold slightly to be less sensitive to minor scrolls
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

        // --- Header and Footer Opacity ---
        const headerFooterOpacity = 1 - Math.min(1, scrollY / (viewportHeight * 0.5));
        if (headerTop) headerTop.style.opacity = headerFooterOpacity;
        if (headerBottom) headerBottom.style.opacity = headerFooterOpacity;
        if (footer) footer.style.opacity = headerFooterOpacity;

        // --- Background Transitions ---
        if (scrollY <= transitionDuration) {
            const progress = scrollY / transitionDuration;
            
            // Fade out the initial backgrounds
            staticBackground.style.opacity = 1 - easeInOutCubic(progress);
            montageContainer.style.opacity = 1 - easeInOutCubic(progress);

            // Fade in the middle section
            middleSection.style.opacity = easeInOutCubic(progress);
            middleSection.style.pointerEvents = progress < 0.1 ? 'none' : 'auto'; 
            middleSection.style.visibility = progress < 0.01 ? 'hidden' : 'visible';
        } else { 
            staticBackground.style.opacity = 0;
            montageContainer.style.opacity = 0;
            middleSection.style.opacity = 1;
            middleSection.style.pointerEvents = 'auto';
            middleSection.style.visibility = 'visible';
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
            const thresholds = [0, transitionDuration];
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
            if (scrollY < transitionDuration) {
                event.preventDefault();
                smoothScrollTo(transitionDuration);
            }
        } else if (event.key === 'PageUp' || event.key === 'ArrowUp') {
            if (scrollY > 0) {
                event.preventDefault();
                smoothScrollTo(0);
            }
        }
    });
    
    updateVisuals(); // Initial update
});