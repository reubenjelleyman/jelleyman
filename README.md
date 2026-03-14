# Jelleyman Website

A personal portfolio website for Reuben Jelleyman, a composer.

## Project Structure

*   `index.html`: The main entry point of the website.
*   `bio.html`, `contact.html`, `electronic.html`, `instrumental.html`, `scrapbook.html`: Additional pages of the website.
*   `JELLEYMAN-css/`: Contains all the CSS files for styling the website.
    *   `general.css`: General styles for the website.
    *   `header.css`: Styles for the header.
    *   `footer.css`: Styles for the footer.
    *   `sidebar.css`: Styles for the sidebar.
    *   `responsive-images.css`: Styles for responsive images.
    *   `montage.css`: Styles for the image montage.
    *   `bio.css`, `electronic.css`, `instrumental.css`, `links.css`: Styles for specific pages.
*   `images/`: Contains all the images used in the website.
*   `locales/`: Contains the JSON files for internationalization (i18n).
    *   `en.json`: English translations.
    *   `fr.json`: French translations.
*   `i18n.js`: The JavaScript file that handles the internationalization.
*   `bio-scroll.js`, `electronic-scroll.js`, `instrumental-scroll.js`, `montage-scroll.js`: JavaScript files for scrolling effects on different pages.

## Setup and Development

To run the website locally, you can use a simple Python HTTP server.

1.  Make sure you have Python 3 installed.
2.  Open a terminal in the root of the project.
3.  Run the following command: `python3 -m http.server 8000`
4.  Open your browser and go to `http://localhost:8000`.

## Features

### Internationalization

The website supports English and French. The content is translated using the `i18n.js` script, which reads the translations from the JSON files in the `locales/` directory. The language is switched based on the user's browser language preference.

### Styling

The website is styled using multiple CSS files located in the `JELLEYMAN-css/` directory. Each file is responsible for styling a specific part of the website.

### Image Montage

The `index.html` page features an image montage that scrolls with the user. This is controlled by the `montage-scroll.js` script and styled by `montage.css`.
