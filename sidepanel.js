// Shared toast-style status helper
function showStatus(message) {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove('show');
  void statusEl.offsetWidth;
  statusEl.classList.add('show');
  setTimeout(() => statusEl.classList.remove('show'), 2500);
}

// -------- ADS LIBRARY HELPER PREFERENCES --------
function saveAdsOptions() {
  const mediaEl = document.getElementById('media_type');
  if (!mediaEl) return;

  chrome.storage.sync.set({ media_type: mediaEl.value }, () => {
    showStatus('Ads Library settings saved.');
  });
}

function restoreAdsOptions() {
  const mediaEl = document.getElementById('media_type');
  if (!mediaEl) return;

  chrome.storage.sync.get({ media_type: 'all' }, (items) => {
    mediaEl.value = items.media_type;
  });
}

// -------- GENERAL SETTINGS (Features) --------
function wireGeneralSettings() {
  const metaToggle = document.getElementById('metaDownloaderToggle');
  const contextToggle = document.getElementById('contextMenuToggle');

  if (metaToggle) {
    chrome.storage.sync.get({ meta_downloader_enabled: true }, (items) => {
      metaToggle.checked = items.meta_downloader_enabled;
    });
    metaToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ meta_downloader_enabled: metaToggle.checked }, () => {
        showStatus(metaToggle.checked ? 'Meta Downloader enabled.' : 'Meta Downloader disabled.');
      });
    });
  }

  if (contextToggle) {
    chrome.storage.sync.get({ context_menu_enabled: true }, (items) => {
      contextToggle.checked = items.context_menu_enabled;
    });
    contextToggle.addEventListener('change', () => {
      chrome.storage.sync.set({ context_menu_enabled: contextToggle.checked }, () => {
        showStatus(contextToggle.checked ? 'Context menu updated.' : 'Context menu updated.');
      });
    });
  }
}



// -------- RATING BANNER --------
function wireRatingBanner() {
  const banner = document.getElementById('ratingBanner');
  const btnRateNow = document.getElementById('btnRateNow');
  const btnDismissRate = document.getElementById('btnDismissRate');

  if (!banner || !btnRateNow || !btnDismissRate) return;

  chrome.storage.sync.get({ rating_dismissed: false }, (items) => {
    if (!items.rating_dismissed) {
      banner.style.display = 'flex';
    }
  });

  const dismissBanner = () => {
    chrome.storage.sync.set({ rating_dismissed: true }, () => {
      banner.style.display = 'none';
    });
  };

  btnDismissRate.addEventListener('click', dismissBanner);

  btnRateNow.addEventListener('click', () => {
    const reviewUrl = 'https://chromewebstore.google.com/detail/facebook-ads-library-down/mmcndinbnbpoeaaibkicphphkgjbmngp/reviews';
    chrome.tabs.create({ url: reviewUrl });
    dismissBanner();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  wireRatingBanner();
  restoreAdsOptions();
  wireGeneralSettings();

  const mediaEl = document.getElementById('media_type');

  if (mediaEl) mediaEl.addEventListener('change', saveAdsOptions);
});
