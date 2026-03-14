let currentTranslations = {};
let currentLang = '';
let hoverTimeout = null;

let staticBackgroundElement = null;
let montageContainer = null;
const defaultBackgroundImage = "url('../images/montage-1-5.jpg')";

export function setTemporaryBackground(imageUrl) {
    if (montageContainer) {
        montageContainer.style.backgroundImage = `url('${imageUrl}')`;
        montageContainer.style.opacity = 1;
    }
}

export function clearTemporaryBackground() {
    if (montageContainer) {
        montageContainer.style.opacity = 0;
    }
}

// These functions are imported by i18n.js and need to exist.
export function pauseAnimation() {}
export function resumeAnimation() {}

const renderLanguageSwitcher = () => {
    return `
        <div class="language">
            <div><a href="#" data-lang="fr" data-background-image="images/sidebar-fr.jpg">fr</a></div>
            <div class="separator">|</div>
            <div><a href="#" data-lang="en" data-background-image="images/sidebar-en.jpg">en</a></div>
        </div>
    `;
};

const renderSidebar = (translations, currentPage) => {
    const sidebarItems = [
        { href: 'bio.html', i18nKey: 'bio', backgroundImage: 'images/montage-1-1.jpg' },
        { href: 'instrumental.html', i18nKey: 'instrumental', backgroundImage: 'images/montage-1-2.jpg' },
        { href: 'electronic.html', i18nKey: 'electronic', backgroundImage: 'images/montage-1-3.jpg' },
        { href: 'scrapbook.html', i18nKey: 'scrapbook', backgroundImage: 'images/montage-1-4.jpg' },
        { href: 'contact.html', i18nKey: 'contact', backgroundImage: 'images/montage-1-5.jpg' }
    ];

    let sidebarHtml = '';

    sidebarItems.forEach(item => {
        const isActive = currentPage.includes(item.href); // Check if current page matches item's href
        sidebarHtml += `
            <div class="sidebar-element">
                <div class="sidebar-background-image" style="background-image: url('${item.backgroundImage}');"></div>
                ${isActive ? `<span data-i18n="${item.i18nKey}" style="opacity: 1;">${translations[item.i18nKey]}</span>` : `<a href="${item.href}" data-i18n="${item.i18nKey}" style="opacity: 1;"></a>`}
            </div>
        `;
    });

    return sidebarHtml;
};

const fetchTranslations = async (lang) => {
    console.log(`Fetching translations for: ${lang}`);
    try {
        const response = await fetch(`./locales/${lang}.json?v=${new Date().getTime()}`);
        if (!response.ok) {
            console.error(`Failed to load language file: ${response.status} ${response.statusText}`);
            return {};
        }
        const translations = await response.json();
        console.log('Translations loaded:', translations);
        return translations;
    } catch (error) {
        console.error('Error loading or parsing language file:', error);
        return {};
    }
};

const applyTranslationsToDOM = (translations, forceAnimation = true) => { // New parameter
    document.querySelectorAll('[data-i18n]').forEach(element => {
        if (element.getAttribute('data-no-fade-i18n') === 'true') {
            const key = element.getAttribute('data-i18n');
            element.innerHTML = translations[key];
            return; // Skip animation for this element
        }

        const key = element.getAttribute('data-i18n');
        if (element.tagName === 'TITLE') {
            document.title = translations[key];
        } else {
            const currentContent = element.innerHTML;
            const newContent = translations[key];

            if (forceAnimation || currentContent !== newContent) { // Animate if forced or content is different
                element.style.opacity = 0;
                setTimeout(() => {
                    element.innerHTML = newContent;
                    element.style.opacity = 1;
                }, 500); // Half of the 1000ms text fade duration
            } else {
                // If not forced and content is the same, just ensure opacity is 1 (no animation)
                element.style.opacity = 1;
            }
        }
    });
    console.log('Translations applied to DOM.');
};

const loadLanguage = async (lang) => {
    currentTranslations = await fetchTranslations(lang);
    currentLang = lang;

    // Render the language switcher
    const languageSwitcherContainer = document.getElementById('language-switcher-container');
    if (languageSwitcherContainer) {
        languageSwitcherContainer.innerHTML = renderLanguageSwitcher();
        // No need to re-apply translations or opacity here, as renderLanguageSwitcher creates with correct content
    }

    // Render the sidebar after translations are loaded
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    if (sidebarPlaceholder) {
        const currentPage = window.location.pathname.split('/').pop();
        sidebarPlaceholder.innerHTML = renderSidebar(currentTranslations, currentPage);
        // Re-apply translations to the newly rendered sidebar elements
        // These elements are already created with opacity: 1 inline, so just set innerHTML
        sidebarPlaceholder.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.innerHTML = currentTranslations[key];
        });
    }
    return currentTranslations; // Return the fetched translations
};

const attachSidebarEventListeners = () => {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
    const languageSwitcherContainer = document.getElementById('language-switcher-container');

    if (languageSwitcherContainer) {
        languageSwitcherContainer.addEventListener('click', async (event) => {
            const target = event.target;
            if (target.matches('.language a')) {
                event.preventDefault();
                const lang = target.getAttribute('data-lang');
                if (lang !== currentLang) {
                    localStorage.setItem('lang', lang);
                    const newTranslations = await loadLanguage(lang);
                    applyTranslationsToDOM(newTranslations, false);
                }
            }
        });

        languageSwitcherContainer.addEventListener('mouseover', async (event) => {
            const target = event.target;
            if (target.matches('.language a')) {
                clearTimeout(hoverTimeout);
                const lang = target.getAttribute('data-lang');
                const backgroundImage = target.getAttribute('data-background-image');

                if (lang !== currentLang) {
                    const tempTranslations = await fetchTranslations(lang);
                    applyTranslationsToDOM(tempTranslations, true);
                }
                
                if (backgroundImage) {
                    setTemporaryBackground(backgroundImage);
                }
            }
        });

        languageSwitcherContainer.addEventListener('mouseout', (event) => {
            const target = event.target;
            if (target.matches('.language a')) {
                const lang = target.getAttribute('data-lang');
                hoverTimeout = setTimeout(() => {
                    if (lang !== currentLang) {
                        applyTranslationsToDOM(currentTranslations, true);
                    }
                    clearTemporaryBackground();
                }, 150);
            }
        });
    }

    if (sidebarPlaceholder) {
        sidebarPlaceholder.addEventListener('mouseover', async (event) => {
            const target = event.target;
            if (target.matches('.sidebar-element a')) {
                const backgroundImage = target.getAttribute('data-background-image');
                if (backgroundImage) {
                    setTemporaryBackground(backgroundImage);
                }
            }
        });

        sidebarPlaceholder.addEventListener('mouseout', (event) => {
            const target = event.target;
            if (target.matches('.sidebar-element a')) {
                clearTemporaryBackground();
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const userLang = localStorage.getItem('lang') || navigator.language.split('-')[0] || 'en';
    const translations = await loadLanguage(userLang);
    applyTranslationsToDOM(translations, false); // Apply translations to the whole page on load
    attachSidebarEventListeners();

    staticBackgroundElement = document.getElementById('static-background');
    montageContainer = document.querySelector('.background-montage');

    // Set the default, bottom-layer background on load.
    if (staticBackgroundElement) {
        staticBackgroundElement.style.backgroundImage = defaultBackgroundImage;
        staticBackgroundElement.style.opacity = 1; // Ensure it's visible.
    }
});