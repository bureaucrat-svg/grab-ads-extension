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
  const countryEl = document.getElementById('country');
  const mediaEl = document.getElementById('media_type');
  if (!countryEl || !mediaEl) return;

  chrome.storage.sync.set({ country: countryEl.value, media_type: mediaEl.value }, () => {
    showStatus('Ads Library settings saved.');
  });
}

function restoreAdsOptions() {
  const countryEl = document.getElementById('country');
  const mediaEl = document.getElementById('media_type');
  if (!countryEl || !mediaEl) return;

  chrome.storage.sync.get({ country: 'DEFAULT', media_type: 'all' }, (items) => {
    countryEl.value = items.country;
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


// -------- HIDDEN SITES (Management) --------
function loadHiddenDomains() {
  const container = document.getElementById('hiddenSitesList');
  if (!container) return;

  chrome.storage.local.get(['grab_ads_hidden_domains'], (result) => {
    const domains = result.grab_ads_hidden_domains || [];
    
    if (domains.length === 0) {
      container.innerHTML = `<p style="font-size: 13px; color: var(--muted); font-style: italic;">No sites hidden yet.</p>`;
      return;
    }

    container.innerHTML = '';
    domains.forEach(domain => {
      const item = document.createElement('div');
      item.className = 'hidden-site-item';
      
      const name = document.createElement('span');
      name.textContent = domain;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-site-btn';
      removeBtn.textContent = 'Remove';
      removeBtn.onclick = () => removeHiddenDomain(domain);
      
      item.appendChild(name);
      item.appendChild(removeBtn);
      container.appendChild(item);
    });
  });
}

function removeHiddenDomain(domain) {
  chrome.storage.local.get(['grab_ads_hidden_domains'], (result) => {
    let domains = result.grab_ads_hidden_domains || [];
    domains = domains.filter(d => d !== domain);
    
    chrome.storage.local.set({ 'grab_ads_hidden_domains': domains }, () => {
      loadHiddenDomains();
      showStatus(`Removed ${domain} from hidden list.`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  restoreAdsOptions();
  wireGeneralSettings();
  loadHiddenDomains();

  const countryEl = document.getElementById('country');
  const mediaEl = document.getElementById('media_type');

  if (countryEl) countryEl.addEventListener('change', saveAdsOptions);
  if (mediaEl) mediaEl.addEventListener('change', saveAdsOptions);
});
