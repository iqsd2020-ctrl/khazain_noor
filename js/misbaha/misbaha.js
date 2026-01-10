// Misbaha modal controls
// This simple module provides functions to open and close the misbaha
// overlay. The modal displays the misbaha.html page within an iframe.

// Opens the misbaha modal by removing the `hidden` class
function openMisbahaModal() {
    const modal = document.getElementById('misbaha-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Closes the misbaha modal by adding the `hidden` class
function closeMisbahaModal() {
    const modal = document.getElementById('misbaha-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Expose functions to global scope to be used inline in HTML
window.openMisbahaModal = openMisbahaModal;
window.closeMisbahaModal = closeMisbahaModal;