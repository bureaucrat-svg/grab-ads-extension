function showStatus(message) {
  const statusEl = document.getElementById('status');
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.remove('show');
  void statusEl.offsetWidth;
  statusEl.classList.add('show');
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => statusEl.classList.remove('show'), 2200);
}

function wireMediaType() {
  const mediaEl = document.getElementById('media_type');
  chrome.storage.sync.get({ media_type: 'all' }, (items) => {
    mediaEl.value = items.media_type;
  });
  mediaEl.addEventListener('change', () => {
    chrome.storage.sync.set({ media_type: mediaEl.value }, () => showStatus('Media filter saved! 🎞️'));
  });
}

function wireToggle(id, key, message) {
  const el = document.getElementById(id);
  chrome.storage.sync.get({ [key]: true }, (items) => {
    el.checked = items[key];
  });
  el.addEventListener('change', () => {
    chrome.storage.sync.set({ [key]: el.checked }, () => {
      showStatus(`${message} ${el.checked ? 'on 😎' : 'off 😴'}`);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  wireMediaType();
  wireToggle('metaDownloaderToggle', 'meta_downloader_enabled', 'Downloader');
  wireToggle('contextMenuToggle', 'context_menu_enabled', 'Context menu');
});
