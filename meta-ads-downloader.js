// Meta Ads Library Downloader
// Renamed from content-downloader.js

(function () {
  let authAllowed = true;
  let isEnabled = false;
  let initialized = false;
  let storageListenerBound = false;
  let pollingInterval;
  const AD_SELECTOR = '.xh8yej3 .x1gzqxud:not(.ad_library_downloader_extension), ._7jvw:not(.ad_library_downloader_extension), div[role="article"]:not(.ad_library_downloader_extension)';

  const ToastManager = {
    container: null,
    init() {
      if (this.container) return;
      this.container = document.createElement('div');
      Object.assign(this.container.style, {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '2147483647',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        alignItems: 'center'
      });
      document.body.appendChild(this.container);
    },
    show(message, type = 'info', duration = 3000) {
      if (!this.container) this.init();
      const toast = document.createElement('div');
      toast.textContent = message;

      Object.assign(toast.style, {
        background: '#1a1033',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '999px',
        border: '3px solid #ff5fa2',
        boxShadow: '4px 4px 0 #ffd23f',
        fontSize: '14px',
        fontWeight: '800',
        fontFamily: '"Avenir Next", "Trebuchet MS", system-ui, sans-serif',
        opacity: '0',
        transform: 'translateY(16px) scale(0.85) rotate(-2deg)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        maxWidth: '520px',
        width: 'fit-content',
        minWidth: '240px',
        textAlign: 'center'
      });

      this.container.appendChild(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0) scale(1) rotate(0deg)';
      });

      const id = Date.now() + Math.random().toString(36).substr(2, 9);
      toast.dataset.id = id;

      if (duration > 0) {
        setTimeout(() => this.remove(toast), duration);
      }

      return { id, element: toast };
    },
    update(toastObj, message, type) {
      if (!toastObj || !toastObj.element) return;
      toastObj.element.textContent = message;
    },
    remove(toast) {
      if (!toast) return;
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px) scale(0.9)';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }
  };

  function startObserver() {
    if (pollingInterval) return;

    // Use a lightweight periodic check instead of a heavy MutationObserver
    // This completely eliminates DOM mutation CPU trashing during scroll.
    pollingInterval = setInterval(() => {
      if (!isEnabled || !authAllowed) return;
      const newAds = document.querySelectorAll(AD_SELECTOR);
      if (newAds.length) {
        processAds(newAds);
      }
    }, 1200); // 1.2s polling is unnoticeable to the user but saves massive CPU
  }

  function stopObserver() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  }

  function processAds(ads) {
    if (!authAllowed) return;

    ads.forEach((ad) => {
      ad.classList.add('ad_library_downloader_extension');

      // Detect media elements
      const adImageElement = ad.querySelector('.x14ju556 img, .x1ywc1zp img:not(._8nqq)');
      const adVideoElement = ad.querySelector('.x14ju556 video, .x1ywc1zp video');

      // Preferred container (original location)
      const downloadContainer =
        ad.querySelector(
          '.x2lah0s.x9otpla.x14z9mp.x1wsgfga.xdwrcjd .x78zum5[data-sscoverage-ignore="true"]'
        ) ||
        ad.querySelector('.x2lah0s.x9otpla.x14z9mp.x1wsgfga.xdwrcjd') ||
        ad.querySelector('[role="toolbar"]') ||
        null;

      if (!downloadContainer) return;

      // Make sure layout can host the button
      if (getComputedStyle(downloadContainer).position === 'static') {
        downloadContainer.style.display = 'flex';
        downloadContainer.style.flexDirection = 'row-reverse';
      }

      // Avoid duplicates
      if (downloadContainer.querySelector('.ad_library_downloader_download_button')) return;

      // Decide media type
      const mediaType = adVideoElement ? 'video' : adImageElement ? 'image' : null;
      if (!mediaType) return;

      // Create and attach
      const downloadButton = createDownloadButton(mediaType);

      attachDownloadEvent(downloadButton, mediaType, adVideoElement || adImageElement, ad);
      downloadContainer.appendChild(downloadButton);
    });
  }

  function createDownloadButton(mediaType) {
    const el = document.createElement('div');
    el.className = 'ad_library_downloader_download_button';
    el.title = `Download ${mediaType === 'video' ? 'Video' : 'Image'}`;
    el.dataset.mediaType = mediaType;

    el.innerHTML = `
      <svg class="ad_library_downloader_icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; flex-shrink: 0;">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
      Grab it!
    `;

    const INK = '#1a1033';
    const rest = { transform: 'rotate(-2deg)', boxShadow: `3px 3px 0 ${INK}` };
    const hover = { transform: 'rotate(1deg) translate(-2px, -2px)', boxShadow: `5px 5px 0 ${INK}` };
    const press = { transform: 'rotate(0deg) translate(3px, 3px)', boxShadow: `0 0 0 ${INK}` };

    Object.assign(el.style, {
      padding: '5px 12px',
      cursor: 'pointer',
      background: '#ffd23f',
      color: INK,
      border: `2.5px solid ${INK}`,
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '900',
      letterSpacing: '0.2px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: '8px',
      fontFamily: '"Avenir Next", "Trebuchet MS", system-ui, sans-serif',
      userSelect: 'none',
      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background-color 0.2s ease',
      ...rest
    });

    const icon = () => el.querySelector('.ad_library_downloader_icon');

    el.onmouseenter = () => {
      Object.assign(el.style, hover, { background: '#ff5fa2', color: '#ffffff' });
      const svg = icon();
      if (svg && svg.animate) {
        svg.animate(
          [{ transform: 'translateY(0)' }, { transform: 'translateY(4px)' }, { transform: 'translateY(-2px)' }, { transform: 'translateY(0)' }],
          { duration: 450, easing: 'ease-in-out' }
        );
      }
    };
    el.onmouseleave = () => {
      Object.assign(el.style, rest, { background: '#ffd23f', color: INK });
    };
    el.onmousedown = () => Object.assign(el.style, press);
    el.onmouseup = () => Object.assign(el.style, hover);

    return el;
  }

  function attachDownloadEvent(button, mediaType, mediaElement, adContainer) {
    let isProcessing = false;
    const cooldownPeriod = 500;

    button.addEventListener('click', async (e) => {
      e.stopPropagation(); // prevent clicking other things
      if (isProcessing) return;
      isProcessing = true;
      console.log(`[MetaAdsDownloader] Clicked download for ${mediaType}`);
      const toast = ToastManager.show(`Starting download for ${mediaType}...`, 'info', 0);

      try {
        let src = mediaElement.src;
        console.log(`[MetaAdsDownloader] Initial src: ${src}`);

        // --- Video Quality Logic ---
        if (mediaType === 'video') {
          // Check if already HD
          if (mediaElement.videoWidth >= 720 || mediaElement.videoHeight >= 720) {
            console.log('[MetaAdsDownloader] Video is already HD quality (>= 720p).');
            ToastManager.update(toast, 'Video already in HD, downloading...', 'info');
            // Skip quality checks and proceed to download current src
          } else {
            console.log('[MetaAdsDownloader] Starting video quality checks...');
            ToastManager.update(toast, 'Checking for better quality...', 'info');

            // 0. Find and Click "Play Video" first
            let playButton = null;
            let playContainer = mediaElement;
            let pAttempts = 0;
            // Traverse up to find container with play button
            while (playContainer && pAttempts < 20) {
              if (playContainer.querySelector) {
                const btn = playContainer.querySelector('div[aria-label="Play Video"]');
                if (btn) {
                  playButton = btn;
                  console.log(`[MetaAdsDownloader] Play button found at ancestor level ${pAttempts}`);
                  break;
                }
              }
              playContainer = playContainer.parentElement;
              pAttempts++;
            }

            if (playButton) {
              console.log('[MetaAdsDownloader] Clicking Play Video button...');
              playButton.click();
              // Wait for video to start/interface to load. The settings button might appear after this.
              await new Promise(r => setTimeout(r, 100));

              // 0.1 Find and Click "Pause"
              // Search based on aria-label or icon
              let pauseButton = null;
              // Reuse playContainer or search from mediaElement's container
              let pauseContainer = mediaElement;
              let pauseAttempts = 0;
              while (pauseContainer && pauseAttempts < 20) {
                if (pauseContainer.querySelector) {
                  // Strategy 1: Aria Label "Pause"
                  let btn = pauseContainer.querySelector('div[aria-label="Pause"]');
                  // Strategy 2: Visual Icon if needed (background-position: 0px -231px)
                  if (!btn) {
                    const icons = pauseContainer.querySelectorAll('i[style*="j8sTObwaCrv.png"]');
                    for (let icon of icons) {
                      if (icon.style.backgroundPosition.includes('0px -231px')) {
                        btn = icon.closest('div[role="button"]') || icon;
                        break;
                      }
                    }
                  }

                  if (btn) {
                    pauseButton = btn;
                    console.log(`[MetaAdsDownloader] Pause button found at ancestor level ${pauseAttempts}`);
                    break;
                  }
                }
                pauseContainer = pauseContainer.parentElement;
                pauseAttempts++;
              }

              if (pauseButton) {
                console.log('[MetaAdsDownloader] Clicking Pause button...');
                pauseButton.click();
                await new Promise(r => setTimeout(r, 1000));
              } else {
                console.log('[MetaAdsDownloader] Pause button NOT found.');
              }
            } else {
              console.log('[MetaAdsDownloader] Play Video button NOT found (video might be playing or auto-played).');
            }

            // Helper to find element by text or visual signature
            const findSettingsButton = (container) => {
              // Strategy 1: Aria Label
              let btn = container.querySelector('div[aria-label="Settings"]');
              if (btn) return btn;

              // Strategy 2: Visual Icon (Gear) - check for specific background position in style
              // Position: -21px -294px
              const icons = container.querySelectorAll('i[style*="j8sTObwaCrv.png"]');
              for (let icon of icons) {
                if (icon.style.backgroundPosition.includes('-21px -294px')) {
                  // Return the clickable parent (usually the generic div role=button wrapping it)
                  return icon.closest('div[role="button"]') || icon;
                }
              }
              return null;
            };

            const findQualityButton = () => {
              // Strategy 1: Text "Quality"
              const buttons = Array.from(adContainer.querySelectorAll('div[role="button"]'));
              let btn = buttons.find(el => el.textContent.includes('Quality'));
              if (btn) return btn;

              // Strategy 2: Visual Icon (Sliders)
              // Position: -60px -336px
              const icons = adContainer.querySelectorAll('i[style*="j8sTObwaCrv.png"]');
              for (let icon of icons) {
                if (icon.style.backgroundPosition.includes('-60px -336px')) {
                  return icon.closest('div[role="button"]') || icon;
                }
              }
              return null;
            };

            // 1. Find Settings button
            let currentElement = mediaElement;
            let settingsButton = null;
            let attempts = 0;

            // Traverse up to find a container that has the settings button
            while (currentElement && attempts < 20) {
              if (currentElement.querySelector) {
                const found = findSettingsButton(currentElement);
                if (found) {
                  settingsButton = found;
                  console.log(`[MetaAdsDownloader] Settings button found at ancestor level ${attempts}`);
                  break;
                }
              }
              currentElement = currentElement.parentElement;
              attempts++;
            }

            if (settingsButton) {
              console.log('[MetaAdsDownloader] Settings button found. Clicking...');
              settingsButton.click();
              await new Promise(r => setTimeout(r, 200)); // Wait for menu

              // 2. Find "Quality" menu item
              console.log('[MetaAdsDownloader] Searching for "Quality" menu item...');
              const qualityButton = findQualityButton();

              if (qualityButton) {
                console.log('[MetaAdsDownloader] Quality button found. Clicking...');
                qualityButton.click();
                await new Promise(r => setTimeout(r, 200)); // Wait for quality options

                // 3. Find "HD" option
                console.log('[MetaAdsDownloader] Searching for HD option...');
                ToastManager.update(toast, 'Looking for HD option...', 'info');

                // Relaxed Search: Check if text content INCLUDES "hd" (case insensitive)
                // Also verify it's a button and likely visible
                const buttons = Array.from(adContainer.querySelectorAll('div[role="button"]'));
                const hdOption = buttons.find(el => {
                  const text = el.textContent.trim().toLowerCase();
                  const match = text.includes('hd') || text.includes('1080p') || text.includes('720p');
                  return match && el.offsetParent !== null; // check visibility
                });

                if (hdOption) {
                  console.log(`[MetaAdsDownloader] HD option found: "${hdOption.textContent}". Clicking...`);
                  const originalSrc = mediaElement.src;
                  hdOption.click();

                  // 4. Wait for URL change
                  console.log('[MetaAdsDownloader] Waiting for URL update...');
                  ToastManager.update(toast, 'Switching to HD quality...', 'info');
                  for (let i = 0; i < 25; i++) { // Wait up to 5 seconds
                    await new Promise(r => setTimeout(r, 200));
                    if (mediaElement.src !== originalSrc) {
                      src = mediaElement.src;
                      console.log(`[MetaAdsDownloader] URL updated to HD source: ${src}`);
                      break;
                    }
                  }
                  if (src === originalSrc) {
                    console.log('[MetaAdsDownloader] URL did not change within timeout (already HD or failed).');
                  }
                } else {
                  console.log('[MetaAdsDownloader] HD option NOT found.');
                  // Debug: Print active candidates
                  const candidates = Array.from(adContainer.querySelectorAll('div[role="button"]'))
                    .filter(el => el.offsetParent !== null)
                    .map(el => `"${el.textContent}"`);
                  console.log('[MetaAdsDownloader] Visible buttons:', candidates.slice(0, 20));
                }
              } else {
                console.log('[MetaAdsDownloader] Quality button NOT found.');
                // Debug: Print active candidates
                const candidates = Array.from(adContainer.querySelectorAll('div[role="button"]'))
                  .filter(el => el.offsetParent !== null)
                  .map(el => `"${el.textContent}"`);
                console.log('[MetaAdsDownloader] Visible buttons:', candidates.slice(0, 20));
              }
            } else {
              console.log('[MetaAdsDownloader] Settings button NOT found after traversing 20 levels up.');
            }

            // If we reached here and src didn't change (or checks failed), we fall back to current
            if (mediaElement.src === src) { // src variable holds initial, if it hasn't changed
              ToastManager.update(toast, 'HD not available, downloading current quality...', 'info');
            }
          } // End else (not already HD)
        }
        // --- End Video Quality Logic ---

        if (!src) {
          console.log('[MetaAdsDownloader] No source URL found. Aborting.');
          ToastManager.update(toast, 'No media source found', 'error');
          setTimeout(() => ToastManager.remove(toast.element), 3000);
          return;
        }

        console.log(`[MetaAdsDownloader] Proceeding to download from: ${src}`);
        ToastManager.update(toast, 'Downloading media...', 'info');

        const meta = {
          image: { name: 'Image_Ad.png', type: 'image/png' },
          video: { name: 'Video_Ad.mp4', type: 'video/mp4' }
        };

        const { name, type } = meta[mediaType];

        // Handle blob: urls if any, or just fetch directly

        const response = await fetch(src);
        if (!response.ok) throw new Error(`Failed to download (${response.status})`);

        const blob = await response.blob();
        const file = new File([blob], name, { type });

        const fileURL = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = fileURL;

        // Try to get filename from URL if valid
        const urlFilename = src.split('/').pop().split('?')[0];
        if (urlFilename && urlFilename.length > 4) link.download = urlFilename;
        else link.download = name;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileURL);
        console.log('[MetaAdsDownloader] Download triggered successfully.');
        ToastManager.update(toast, 'Download started!', 'success');
        setTimeout(() => ToastManager.remove(toast.element), 3000);
      } catch (err) {
        console.error(`[MetaAdsDownloader] Error downloading ${mediaType}:`, err);
        ToastManager.update(toast, 'Download failed', 'error');
        setTimeout(() => ToastManager.remove(toast.element), 3000);
      } finally {
        setTimeout(() => (isProcessing = false), cooldownPeriod);
      }
    });
  }

  function removeDownloadButtons() {
    const btns = document.querySelectorAll('.ad_library_downloader_download_button');
    btns.forEach(btn => btn.remove());
    // Also remove the marker class from the ads so they can be re-processed if re-enabled
    const ads = document.querySelectorAll('.ad_library_downloader_extension');
    ads.forEach(ad => ad.classList.remove('ad_library_downloader_extension'));
  }

  function bindStorageListener() {
    if (storageListenerBound) return;
    storageListenerBound = true;

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' && changes.meta_downloader_enabled) {
        isEnabled = changes.meta_downloader_enabled.newValue;
        if (isEnabled && authAllowed) {
          scheduleStart();
        } else {
          stopObserver();
          removeDownloadButtons();
        }
      }
    });
  }

  function waitForAds(timeoutMs = 15000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        if (document.querySelector(AD_SELECTOR)) {
          resolve(true);
          return;
        }
        if (Date.now() - start >= timeoutMs) {
          resolve(false);
          return;
        }
        setTimeout(check, 300);
      };
      check();
    });
  }

  function scheduleStart() {
    if (!isEnabled || !authAllowed) return;

    const startWork = async () => {
      await waitForAds();
      startObserver();
      const ads = document.querySelectorAll(AD_SELECTOR);
      if (ads.length) processAds(ads);
    };

    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => { startWork(); }, { timeout: 2000 });
    } else {
      setTimeout(startWork, 400);
    }
  }

  function activate() {
    if (initialized) {
      if (isEnabled) {
        scheduleStart();
      }
      return;
    }

    initialized = true;
    bindStorageListener();

    const onReady = () => {
      chrome.storage.sync.get({ meta_downloader_enabled: true }, (items) => {
        isEnabled = items.meta_downloader_enabled;
        if (isEnabled && authAllowed) {
          scheduleStart();
        }
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onReady, { once: true });
    } else {
      onReady();
    }
  }

  function deactivate() {
    stopObserver();
    removeDownloadButtons();
  }

  activate();
})();
