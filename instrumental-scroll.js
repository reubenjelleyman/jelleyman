document.addEventListener('DOMContentLoaded', () => {
    const body = document.querySelector('body.body-instrumental');
    if (!body) return; 

    const background = document.getElementById('instrumental-background');
    const middleSection = document.getElementById('middle-section');
    const finalImageContainer = document.getElementById('final-image-container');
    const header = document.querySelector('.header-top');
    const sidebar = document.getElementById('sidebar-placeholder');
    const footer = document.querySelector('.footer');
    const soundcloudWrapper = document.querySelector('.soundcloud-player-wrapper');
    const scrollArrow = document.getElementById('scroll-arrow');
    const scrollArrowUp = document.getElementById('scroll-arrow-up');

    let scrollY = 0;
    let isAnimating = false;
    const viewportHeight = window.innerHeight;

    const transitionDuration = viewportHeight * 1.8;
    const headerFadeOutPoint = transitionDuration / 3;

    // Remove the dead zone. Phase 3 starts immediately after Phase 1 finishes.
    const maxScroll = transitionDuration * 2; 

    const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    function updateVisuals() {
        if (scrollY > 50) {
            if (soundcloudWrapper) soundcloudWrapper.classList.add('shrunk');
        } else {
            if (soundcloudWrapper) soundcloudWrapper.classList.remove('shrunk');
        }

        // --- Arrow Visibility ---
        if (scrollArrow) {
            if (scrollY < 50 || (scrollY >= transitionDuration - 50 && scrollY <= transitionDuration + 50)) {
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

            // Background fade out (middle third)
            const bgProgress = Math.max(0, (progress - 1/3) * 3);
            background.style.opacity = 1 - easeInOutCubic(Math.min(1, bgProgress));
            background.style.transform = `translateY(-${easeInOutCubic(Math.min(1, bgProgress)) * 20}vh)`;

            // Middle section fade in (last third)
            const msProgress = Math.max(0, (progress - 2/3) * 3);
            middleSection.style.opacity = easeInOutCubic(Math.min(1, msProgress));
            middleSection.style.visibility = msProgress < 0.01 ? 'hidden' : 'visible';

            finalImageContainer.style.opacity = 0;
            finalImageContainer.style.visibility = 'hidden';
            if (sidebar) sidebar.style.opacity = 1; 
            if (footer) footer.style.opacity = 1; 
        }
        // --- Phase 2: Middle Section -> Black -> Final Image ---
        else if (scrollY > transitionDuration && scrollY <= maxScroll) {
            const phaseProgress = (scrollY - transitionDuration) / transitionDuration;

            // Middle section, sidebar, and footer fade out (first third)
            const msFadeOutProgress = Math.min(1, phaseProgress * 3);
            middleSection.style.opacity = 1 - easeInOutCubic(msFadeOutProgress);
            middleSection.style.visibility = msFadeOutProgress > 0.99 ? 'hidden' : 'visible';
            if (sidebar) sidebar.style.opacity = 1 - easeInOutCubic(msFadeOutProgress);
            if (footer) footer.style.opacity = 1 - easeInOutCubic(msFadeOutProgress);

            // Final image fade in (last third)
            const fiProgress = Math.max(0, (phaseProgress - 2/3) * 3);
            finalImageContainer.style.opacity = easeInOutCubic(Math.min(1, fiProgress));
            finalImageContainer.style.visibility = 'visible';

            background.style.opacity = 0;
            if (header) {
                header.style.opacity = 0;
                header.style.pointerEvents = 'none';
                header.style.visibility = 'hidden';
            }
        }

        // --- Final check for pointer events ---
        if (middleSection.style.opacity > 0.1) {
            middleSection.style.pointerEvents = 'auto';
        } else {
            middleSection.style.pointerEvents = 'none';
        }
    }

    let snapTimeout = null;

    const contentWrapper = document.querySelector('#middle-section .content-wrapper');
    window.addEventListener('wheel', (event) => {
        // Allow native scrolling within the content wrapper if it's active
        if (middleSection.style.pointerEvents === 'auto' && contentWrapper) {
            const isScrollingDown = event.deltaY > 0;
            const isScrollingUp = event.deltaY < 0;
            const isAtTop = contentWrapper.scrollTop === 0;
            const isAtBottom = contentWrapper.scrollTop >= contentWrapper.scrollHeight - contentWrapper.clientHeight - 1;

            if ((isScrollingUp && !isAtTop) || (isScrollingDown && !isAtBottom)) {
                // Let the browser handle the native scroll
                return;
            }
        }
        
        // Hijack scroll for page transitions
        event.preventDefault();
        
        if (isAnimating) return; // Prevent interference during arrow click animations

        const sensitivity = 2.0; // Make scrolling much easier on trackpads
        scrollY += event.deltaY * sensitivity;
        scrollY = Math.max(0, Math.min(maxScroll, scrollY));
        updateVisuals();

        // Auto-snap to nearest section after scrolling stops
        clearTimeout(snapTimeout);
        snapTimeout = setTimeout(() => {
            const thresholds = [0, transitionDuration, maxScroll];
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
            if (scrollY < transitionDuration - 10) {
                smoothScrollTo(transitionDuration);
            } else {
                smoothScrollTo(maxScroll);
            }
        });
    }

    // Scroll up by clicking arrow
    if (scrollArrowUp) {
        scrollArrowUp.addEventListener('click', () => {
            if (scrollY > transitionDuration + 10) {
                smoothScrollTo(transitionDuration);
            } else {
                smoothScrollTo(0);
            }
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
            if (middleSection.style.pointerEvents === 'auto' && (contentWrapper.scrollTop < contentWrapper.scrollHeight - contentWrapper.clientHeight)) {
                 return; // Let native scroll happen
            }
            event.preventDefault();
            let targetScrollY = 0;
            if (scrollY < transitionDuration - 10) {
                targetScrollY = transitionDuration;
            } else {
                targetScrollY = maxScroll;
            }
            smoothScrollTo(targetScrollY);
        } else if (event.key === 'PageUp' || event.key === 'ArrowUp') {
            if (middleSection.style.pointerEvents === 'auto' && contentWrapper.scrollTop > 0) {
                return; // Let native scroll happen
            }
            event.preventDefault();
            let targetScrollY = 0;
            if (scrollY > transitionDuration + 10) {
                targetScrollY = transitionDuration;
            } else {
                targetScrollY = 0;
            }
            smoothScrollTo(targetScrollY);
        }
    });

    // SoundCloud API Integration
    const scIframe = document.getElementById('sc-widget');
    if (scIframe && window.SC) {
        const widget = SC.Widget(scIframe);
        const worksListItems = document.querySelectorAll('.selected-oeuvre-section ul li');

        function updateNowPlaying(trackTitle) {
            document.querySelectorAll('.now-playing-indicator').forEach(el => el.remove());

            if (!trackTitle) return;

            const normalizedTrackTitle = trackTitle.toLowerCase().replace(/[()[\]]/g, '').trim();

            worksListItems.forEach(li => {
                const strongTag = li.querySelector('strong');
                if (strongTag) {
                    const titleText = strongTag.textContent.toLowerCase();
                    const mainTitle = titleText.split('(')[0].trim();

                    if (mainTitle.length > 3 && (normalizedTrackTitle.includes(mainTitle) || mainTitle.includes(normalizedTrackTitle))) {
                        const indicator = document.createElement('span');
                        indicator.className = 'now-playing-indicator';
                        indicator.textContent = '[now playing]';
                        indicator.style.color = '#ff5500';
                        indicator.style.fontSize = '0.9em';
                        indicator.style.fontStyle = 'italic';
                        indicator.style.fontWeight = 'normal';
                        indicator.style.marginLeft = '0.8rem';
                        strongTag.appendChild(indicator);
                    }
                }
            });
        }

        widget.bind(SC.Widget.Events.PLAY, () => {
            widget.getCurrentSound((sound) => {
                if (sound) updateNowPlaying(sound.title);
            });
        });

        widget.bind(SC.Widget.Events.PAUSE, () => {
            document.querySelectorAll('.now-playing-indicator').forEach(el => el.remove());
        });

        widget.bind(SC.Widget.Events.FINISH, () => {
            document.querySelectorAll('.now-playing-indicator').forEach(el => el.remove());
        });
    }
    
    updateVisuals();
});