/* Theme switcher functionality extracted from index.html */
function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-mode');
    // Update all theme toggle icons in the document
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(icon => {
        if (body.classList.contains('light-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            icon.classList.add('text-yellow-400');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.remove('text-yellow-400');
            icon.classList.add('fa-moon');
        }
    });
}