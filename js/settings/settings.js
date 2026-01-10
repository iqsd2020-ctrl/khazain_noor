/* Font and reading settings extracted from index.html */

// Scale for reading text size; persists across invocations of changeFontSize
let currentFontSizeScale = 1;

/**
 * Change the application UI font. Receives a CSS font-family string and
 * updates the CSS variable used throughout the document.
 * @param {string} fontFamily
 */
function changeAppFont(fontFamily) {
    document.documentElement.style.setProperty('--app-font', fontFamily);
}

/**
 * Change the reading font used for textual content.
 * @param {string} fontFamily
 */
function changeReadingFont(fontFamily) {
    document.documentElement.style.setProperty('--reading-font', fontFamily);
}

/**
 * Adjust the reading font size scale. The provided delta is added to the
 * internal scale and clamped between 0.8 and 1.6. The CSS variable and
 * on‑screen percentage display are both updated accordingly.
 * @param {number} change
 */
function changeFontSize(change) {
    currentFontSizeScale += change;
    if (currentFontSizeScale < 0.8) currentFontSizeScale = 0.8;
    if (currentFontSizeScale > 1.6) currentFontSizeScale = 1.6;
    document.documentElement.style.setProperty('--reading-size-scale', currentFontSizeScale);
    const display = document.getElementById('fontSizeDisplay');
    if (display) {
        display.textContent = Math.round(currentFontSizeScale * 100) + '%';
    }
}