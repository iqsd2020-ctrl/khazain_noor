// Misbaha integration helpers
// Legacy functions to open and close the misbaha. These are kept for backward
// compatibility in case some elements still reference openMisbahaModal().
// Instead of opening a modal overlay, these functions now navigate to the
// misbaha page inside the application using openPage().

function openMisbahaModal() {
    // Navigate to the misbaha view in the app. The header will hide and
    // the misbaha page will appear within the application interface.
    if (typeof openPage === 'function') {
        openPage('misbaha-view');
    }
}

function closeMisbahaModal() {
    // Close by returning to the previous page. We simply call closePage if available.
    if (typeof closePage === 'function') {
        closePage();
    }
}

// Expose functions to global scope. Any inline references will now open
// the misbaha view instead of attempting to show a modal.
window.openMisbahaModal = openMisbahaModal;
window.closeMisbahaModal = closeMisbahaModal;