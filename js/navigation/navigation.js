/* Page navigation helpers extracted from index.html */

/**
 * Open a sub‑view by hiding the main view and header and showing the target
 * element. Adjusts padding on the main container and scrolls to top.
 * @param {string} pageId
 */
function openPage(pageId) {
    document.getElementById('main-header').classList.add('hidden-header');
    const mainContainer = document.getElementById('main-container');
    // Remove any existing top‑padding classes on the main container.  When
    // navigating away from the home page we want to minimise the vertical
    // space above the sub‑view header, so clear the large padding classes
    // applied on the main view and apply a smaller one instead.
    mainContainer.classList.remove('pt-24', 'pt-12', 'pt-8', 'pt-6', 'pt-4');
    // Apply no top padding for subpages.  This removes the empty
    // area above the control row and allows the header row to align
    // closely to the top of the viewport.
    mainContainer.classList.add('pt-0');
    document.getElementById('main-view').classList.add('hidden');
    document.getElementById(pageId).classList.remove('hidden');
    window.scrollTo(0, 0);

    // If navigating to the supplications list, ensure the list is rendered
    if (pageId === 'duaa-list-view' && typeof renderDuaaList === 'function') {
        // Delay slightly to allow any pending data load to finish
        try {
            renderDuaaList();
        } catch (e) {
            console.error('Error rendering duaa list:', e);
        }
    }
    // If navigating to the monajat list, ensure the list is rendered
    if (pageId === 'monajat-list-view' && typeof renderMonajatList === 'function') {
        try {
            renderMonajatList();
        } catch (e) {
            console.error('Error rendering monajat list:', e);
        }
    }

    // Render Baqiat categories when navigating to baqiat section
    if (pageId === 'baqiat-categories-view' && typeof renderBaqiatCategories === 'function') {
        try {
            renderBaqiatCategories();
        } catch (e) {
            console.error('Error rendering Baqiat categories:', e);
        }
    }
    // Render Rights categories when navigating to rights section
    if (pageId === 'rights-categories-view' && typeof renderRightsCategories === 'function') {
        try {
            renderRightsCategories();
        } catch (e) {
            console.error('Error rendering rights categories:', e);
        }
    }
    // Render Ziyarat categories when navigating to Ziyarat section
    if (pageId === 'ziyarat-categories-view' && typeof renderZiyaratCategories === 'function') {
        try {
            renderZiyaratCategories();
        } catch (e) {
            console.error('Error rendering ziyarats categories:', e);
        }
    }
    // Render Nahj categories when navigating to Nahj section
    if (pageId === 'nahj-categories-view' && typeof renderNahjCategories === 'function') {
        try {
            renderNahjCategories();
        } catch (e) {
            console.error('Error rendering Nahj categories:', e);
        }
    }

    // Render Khutbah categories when navigating to Khutbah section
    if (pageId === 'khutbah-categories-view' && typeof renderKhutbahCategories === 'function') {
        try {
            renderKhutbahCategories();
        } catch (e) {
            console.error('Error rendering khutbah categories:', e);
        }
    }

    // Render favorites list when navigating to favorites view
    if (pageId === 'favorites-view' && typeof renderFavorites === 'function') {
        try {
            renderFavorites();
        } catch (e) {
            console.error('Error rendering favorites:', e);
        }
    }
}

/**
 * Close any open sub‑view and return to the main view. Restores header and
 * container padding and hides all secondary views.
 */
function closePage() {
    document.getElementById('main-header').classList.remove('hidden-header');
    const mainContainer = document.getElementById('main-container');
    // Restore the original large padding for the main view
    mainContainer.classList.add('pt-24');
    // Clean up any smaller paddings that may have been applied when
    // navigating to subviews
    mainContainer.classList.remove('pt-12', 'pt-8', 'pt-6', 'pt-4', 'pt-2', 'pt-0');
    // hide all known sub‑pages
    const dailyDeedsView = document.getElementById('daily-deeds-view');
    if (dailyDeedsView) dailyDeedsView.classList.add('hidden');
    const monthsView = document.getElementById('months-view');
    if (monthsView) monthsView.classList.add('hidden');
    const occasionsDetailsView = document.getElementById('occasions-details-view');
    if (occasionsDetailsView) occasionsDetailsView.classList.add('hidden');
    // Hide supplication views when closing back to main
    const duaaListView = document.getElementById('duaa-list-view');
    if (duaaListView) duaaListView.classList.add('hidden');
    const duaaDetailsView = document.getElementById('duaa-details-view');
    if (duaaDetailsView) duaaDetailsView.classList.add('hidden');
    document.getElementById('main-view').classList.remove('hidden');
    // Hide monajat views when closing back to main
    const monajatListView = document.getElementById('monajat-list-view');
    if (monajatListView) monajatListView.classList.add('hidden');
    const monajatDetailsView = document.getElementById('monajat-details-view');
    if (monajatDetailsView) monajatDetailsView.classList.add('hidden');

    // Hide Baqiat views
    const baqiatCategoriesView = document.getElementById('baqiat-categories-view');
    const baqiatItemsView = document.getElementById('baqiat-items-view');
    const baqiatDetailsView = document.getElementById('baqiat-details-view');
    if (baqiatCategoriesView) baqiatCategoriesView.classList.add('hidden');
    if (baqiatItemsView) baqiatItemsView.classList.add('hidden');
    if (baqiatDetailsView) baqiatDetailsView.classList.add('hidden');

    // Hide rights views
    const rightsCategoriesView = document.getElementById('rights-categories-view');
    const rightsItemsView = document.getElementById('rights-items-view');
    const rightsDetailsView = document.getElementById('rights-details-view');
    if (rightsCategoriesView) rightsCategoriesView.classList.add('hidden');
    if (rightsItemsView) rightsItemsView.classList.add('hidden');
    if (rightsDetailsView) rightsDetailsView.classList.add('hidden');

    // Hide Ziyarat views
    const ziyaratCategoriesView = document.getElementById('ziyarat-categories-view');
    const ziyaratItemsView = document.getElementById('ziyarat-items-view');
    const ziyaratDetailsView = document.getElementById('ziyarat-details-view');
    if (ziyaratCategoriesView) ziyaratCategoriesView.classList.add('hidden');
    if (ziyaratItemsView) ziyaratItemsView.classList.add('hidden');
    if (ziyaratDetailsView) ziyaratDetailsView.classList.add('hidden');

    // Hide Nahj views
    const nahjCategoriesView = document.getElementById('nahj-categories-view');
    const nahjItemsView = document.getElementById('nahj-items-view');
    const nahjDetailsView = document.getElementById('nahj-details-view');
    if (nahjCategoriesView) nahjCategoriesView.classList.add('hidden');
    if (nahjItemsView) nahjItemsView.classList.add('hidden');
    if (nahjDetailsView) nahjDetailsView.classList.add('hidden');

    // Hide Khutbah views
    const khutbahCategoriesView = document.getElementById('khutbah-categories-view');
    const khutbahItemsView = document.getElementById('khutbah-items-view');
    const khutbahDetailsView = document.getElementById('khutbah-details-view');
    if (khutbahCategoriesView) khutbahCategoriesView.classList.add('hidden');
    if (khutbahItemsView) khutbahItemsView.classList.add('hidden');
    if (khutbahDetailsView) khutbahDetailsView.classList.add('hidden');

    // Pause and hide khutbah audio when leaving any page
    const khutbahPlayerContainer = document.getElementById('khutbah-audio-player');
    if (khutbahPlayerContainer) {
        const audioEl = khutbahPlayerContainer.querySelector('audio');
        if (audioEl) {
            audioEl.pause();
        }
        khutbahPlayerContainer.classList.add('hidden');
    }

    // Pause and hide monajat audio when leaving any page
    const monajatPlayerContainer = document.getElementById('monajat-audio-player');
    if (monajatPlayerContainer) {
        const monajatAudioEl = monajatPlayerContainer.querySelector('audio');
        if (monajatAudioEl) {
            monajatAudioEl.pause();
        }
        monajatPlayerContainer.classList.add('hidden');
    }

    // Hide favorites view
    const favoritesView = document.getElementById('favorites-view');
    if (favoritesView) favoritesView.classList.add('hidden');

    // Hide misbaha view
    const misbahaView = document.getElementById('misbaha-view');
    if (misbahaView) misbahaView.classList.add('hidden');
}