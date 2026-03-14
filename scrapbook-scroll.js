document.addEventListener('DOMContentLoaded', () => {
    const scrollWrapper = document.querySelector('.scrapbook-scroll-wrapper');

    if (scrollWrapper) {
        scrollWrapper.addEventListener('wheel', (e) => {
            if (e.shiftKey) {
                e.preventDefault();
                scrollWrapper.scrollLeft += e.deltaY + e.deltaX;
            }
        }, { passive: false });
    }

});