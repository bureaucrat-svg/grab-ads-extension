// Meta Ads Library Downloader
// Renamed from content-downloader.js

(function () {
  let authAllowed = true;
  let isEnabled = false;
  let initialized = false;
  let storageListenerBound = false;
  let observer;
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
        background: '#000000',
        color: '#ffffff',
        padding: '12px 24px',
        borderRadius: '999px',
        border: '1px solid #333333',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontSize: '14px',
        fontWeight: '600',
        opacity: '0',
        transform: 'translateY(12px)',
        transition: 'all 0.3s ease',
        maxWidth: '520px',
        width: 'fit-content',
        minWidth: '240px',
        textAlign: 'center'
      });

      this.container.appendChild(toast);

      // Animate in
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
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
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => {
        if (toast.parentElement) toast.parentElement.removeChild(toast);
      }, 300);
    }
  };

  function startObserver() {
    if (observer) return;

    // Debounce processing to avoid spamming on heavy DOM updates
    let timeout;
    const debouncedProcess = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (!isEnabled || !authAllowed) return;
        const newAds = document.querySelectorAll(AD_SELECTOR);
        if (newAds.length) {
          processAds(newAds);
        }
      }, 500); // 500ms debounce
    };

    observer = new MutationObserver(debouncedProcess);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function stopObserver() {
    if (observer) {
      observer.disconnect();
      observer = null;
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

    // Black minimalist icon
    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" viewBox="0 0 550 550">
<path d="M0 0 C1.01446198 0.00215515 2.02892395 0.0043103 3.0741272 0.00653076 C18.04938059 0.05755578 32.63354105 0.44826721 47.375 3.3125 C48.41430664 3.50585938 49.45361328 3.69921875 50.52441406 3.8984375 C111.10523731 15.42070738 171.06922094 47.72720173 210.03515625 96.41796875 C211.57391977 98.32151428 213.14381857 100.20037778 214.74609375 102.05078125 C244.24763186 136.17816053 263.04096233 180.15470176 271.625 224.125 C271.77622314 224.89932373 271.92744629 225.67364746 272.08325195 226.47143555 C275.01065519 242.45396628 275.74790088 258.1546192 275.6875 274.375 C275.68534485 275.41563599 275.6831897 276.45627197 275.68096924 277.52844238 C275.63064282 292.66418638 275.28640011 307.4153087 272.375 322.3125 C272.18164062 323.35035645 271.98828125 324.38821289 271.7890625 325.45751953 C260.2681196 386.04025553 227.96166901 446.00562398 179.26953125 484.97265625 C177.36598572 486.51141977 175.48712222 488.08131857 173.63671875 489.68359375 C130.69123345 526.80797592 69.97710929 550.23106649 13.1796875 550.515625 C12.23757919 550.52268463 11.29547089 550.52974426 10.32481384 550.53701782 C-28.91921677 550.76433688 -28.91921677 550.76433688 -46.625 547.3125 C-47.68025879 547.11382324 -48.73551758 546.91514648 -49.82275391 546.71044922 C-110.52402261 535.01860191 -170.2341764 503.00406761 -209.28515625 454.20703125 C-210.82391977 452.30348572 -212.39381857 450.42462222 -213.99609375 448.57421875 C-243.49763186 414.44683947 -262.29096233 370.47029824 -270.875 326.5 C-271.02622314 325.72567627 -271.17744629 324.95135254 -271.33325195 324.15356445 C-274.10517594 309.01989251 -274.97341827 294.15127917 -274.94067383 278.78564453 C-274.9375253 275.7121997 -274.96103225 272.63973232 -274.98632812 269.56640625 C-275.04595373 251.140621 -273.11417429 233.04171952 -269 215.0625 C-268.74694092 213.95028076 -268.49388184 212.83806152 -268.2331543 211.69213867 C-255.12043677 156.28886496 -223.36823709 101.54357893 -178.51953125 65.65234375 C-176.61598572 64.11358023 -174.73712222 62.54368143 -172.88671875 60.94140625 C-138.76615398 31.44575897 -94.82455222 12.68719579 -50.875 4.0625 C-50.10905518 3.91127686 -49.34311035 3.76005371 -48.55395508 3.60424805 C-32.40416529 0.63392115 -16.38351707 -0.06275731 0 0 Z M-152.625 118.3125 C-153.39457031 119.04122314 -153.39457031 119.04122314 -154.1796875 119.78466797 C-162.16710011 127.36916224 -169.04542415 135.48927658 -175.625 144.3125 C-176.05022949 144.87163086 -176.47545898 145.43076172 -176.91357422 146.00683594 C-184.17050597 155.56556265 -190.08751853 165.67587243 -195.625 176.3125 C-196.15456299 177.31458496 -196.15456299 177.31458496 -196.69482422 178.33691406 C-210.26354565 204.3051995 -218.65861271 234.82429482 -218.828125 264.203125 C-218.83513931 265.02167465 -218.84215363 265.8402243 -218.84938049 266.68357849 C-218.86678269 269.30994232 -218.87323262 271.93608063 -218.875 274.5625 C-218.87601212 275.90908188 -218.87601212 275.90908188 -218.87704468 277.28286743 C-218.86121857 290.5239981 -218.42254516 303.32643183 -215.625 316.3125 C-215.45339355 317.15651367 -215.28178711 318.00052734 -215.10498047 318.87011719 C-206.47819936 360.76281474 -186.11073458 397.5946113 -156.625 428.3125 C-156.13918457 428.82554687 -155.65336914 429.33859375 -155.15283203 429.8671875 C-147.56833776 437.85460011 -139.44822342 444.73292415 -130.625 451.3125 C-130.06586914 451.73772949 -129.50673828 452.16295898 -128.93066406 452.60107422 C-119.37193735 459.85800597 -109.26162757 465.77501853 -98.625 471.3125 C-97.62291504 471.84206299 -97.62291504 471.84206299 -96.60058594 472.38232422 C-46.36097285 498.63308753 13.60109847 501.22925318 67.26171875 484.85546875 C100.10465496 474.28984597 128.63830702 456.05695623 153.375 432.3125 C153.88804687 431.82668457 154.40109375 431.34086914 154.9296875 430.84033203 C162.91710011 423.25583776 169.79542415 415.13572342 176.375 406.3125 C177.01284424 405.47380371 177.01284424 405.47380371 177.66357422 404.61816406 C184.92050597 395.05943735 190.83751853 384.94912757 196.375 374.3125 C196.90456299 373.31041504 196.90456299 373.31041504 197.44482422 372.28808594 C211.01354565 346.3198005 219.40861271 315.80070518 219.578125 286.421875 C219.58513931 285.60332535 219.59215363 284.7847757 219.59938049 283.94142151 C219.61678269 281.31505768 219.62323262 278.68891937 219.625 276.0625 C219.62567474 275.16477875 219.62634949 274.2670575 219.62704468 273.34213257 C219.61121857 260.1010019 219.17254516 247.29856817 216.375 234.3125 C216.20339355 233.46848633 216.03178711 232.62447266 215.85498047 231.75488281 C207.22819936 189.86218526 186.86073458 153.0303887 157.375 122.3125 C156.88918457 121.79945312 156.40336914 121.28640625 155.90283203 120.7578125 C148.31833776 112.77039989 140.19822342 105.89207585 131.375 99.3125 C130.53630371 98.67465576 130.53630371 98.67465576 129.68066406 98.02392578 C120.12193735 90.76699403 110.01162757 84.84998147 99.375 79.3125 C98.70694336 78.95945801 98.03888672 78.60641602 97.35058594 78.24267578 C14.93441455 35.17929859 -86.92709025 55.24986089 -152.625 118.3125 Z " fill="#000000" transform="translate(274.625,-0.3125)"/>
<path d="M0 0 C4.55483547 4.09437396 7.547067 9.92895444 8.8125 15.875 C8.9164839 18.73860533 8.96729031 21.57847192 8.97071838 24.44232178 C8.97565636 25.31553613 8.98059434 26.18875048 8.98568195 27.08842587 C9.0010616 30.01956064 9.00941886 32.95067348 9.01782227 35.88183594 C9.02740042 37.98092339 9.03741046 40.08000892 9.04782104 42.17909241 C9.07488295 47.88320674 9.09588558 53.58732935 9.11582303 59.29147243 C9.13767463 65.25058443 9.16506736 71.20967084 9.19187927 77.16876221 C9.24181732 88.45568379 9.28675204 99.74261956 9.32990164 111.02956891 C9.37926449 123.87828538 9.43418616 136.7269762 9.48958123 149.57566786 C9.60341836 176.00875464 9.71025365 202.44186603 9.8125 228.875 C10.56560959 228.12189041 11.31871918 227.36878082 12.09465027 226.59284973 C67.89543152 170.79206848 67.89543152 170.79206848 69.38780785 169.30378151 C70.77524556 167.91236137 72.14844273 166.50678699 73.52119446 165.10087585 C78.30372541 160.45491312 83.04474066 159.31340137 89.5625 159.375 C90.26624756 159.38072021 90.96999512 159.38644043 91.69506836 159.39233398 C99.83929203 159.66969145 105.63709631 162.68719399 111.6875 168.0625 C117.4331753 174.35150157 119.23797353 181.48740902 119.34375 189.84375 C117.44398396 200.68359154 111.34600922 207.20368029 103.76098633 214.68701172 C102.62105312 215.83344866 101.48240535 216.98116494 100.34494019 218.13005066 C97.2696146 221.22834017 94.17585207 224.30756988 91.07760453 227.38291693 C87.82803362 230.61348755 84.59361051 233.85916642 81.3568573 237.10256958 C75.92090252 242.54485295 70.47280886 247.97474967 65.01733398 253.39746094 C58.72168227 259.65561357 52.44591027 265.93317689 46.18037015 272.22146595 C40.13707747 278.2857485 34.07970724 284.33578113 28.0159359 290.37958145 C25.44252543 292.94503193 22.8741355 295.51535611 20.30973244 298.08980942 C17.28655949 301.12357702 14.25121292 304.1446279 11.2062645 307.15653419 C10.09466662 308.25996406 8.98722685 309.36760214 7.88443947 310.47983742 C-0.52995831 318.95834539 -7.78789231 324.31502615 -19.9375 325.125 C-34.32314195 324.82755252 -42.82740022 313.39042261 -52.31347656 303.95776367 C-53.41143985 302.86935976 -54.50956873 301.78112287 -55.60784912 300.69303894 C-59.18512166 297.14688048 -62.75708849 293.59540553 -66.328125 290.04296875 C-67.24288998 289.13314975 -67.24288998 289.13314975 -68.17613506 288.20495057 C-73.93580721 282.47602147 -79.69344713 276.74505718 -85.44626236 271.00924206 C-92.77734008 263.70009365 -100.11831201 256.40120481 -107.47306466 249.11587733 C-112.66083975 243.97540562 -117.83701395 238.8234315 -123.00481772 233.66288358 C-126.08486689 230.587776 -129.16970961 227.5178762 -132.26715851 224.46028709 C-135.17951564 221.58492724 -138.07716751 218.69551094 -140.96445465 215.79498482 C-142.02181725 214.73767593 -143.08426675 213.68542409 -144.15229797 212.63889313 C-151.10125394 205.82234511 -156.00251353 199.63639338 -157.71875 189.84375 C-157.60699245 181.01490339 -155.58219272 174.06779693 -149.5 167.5 C-142.17099279 160.85682649 -135.70182376 159.44078188 -125.91015625 159.24609375 C-113.40665641 161.35843738 -105.68028238 170.72850574 -97.2109375 179.36328125 C-95.79143397 180.79212444 -94.37081189 182.21985718 -92.9491272 183.64653015 C-89.23250077 187.38213512 -85.53114469 191.13251366 -81.83288574 194.8862915 C-78.04752889 198.72303836 -74.24775953 202.54545394 -70.44921875 206.36914062 C-63.01456043 213.85722513 -55.59597324 221.36101408 -48.1875 228.875 C-48.18603344 227.78647295 -48.18456688 226.6979459 -48.18305588 225.57643318 C-48.14644317 199.0768343 -48.08697022 172.57736164 -48.00359726 146.07786751 C-47.96380646 133.26284707 -47.93141411 120.44788804 -47.91650391 107.6328125 C-47.90348768 96.46177272 -47.87652352 85.29086807 -47.83288693 74.1199044 C-47.81027173 68.20624045 -47.79458937 62.29274317 -47.79561615 56.37903214 C-47.79636271 50.80906158 -47.77841302 45.23945948 -47.74633217 39.66958427 C-47.73783691 37.62907912 -47.73608068 35.58853261 -47.74169731 33.5480175 C-47.793516 11.82294928 -47.793516 11.82294928 -40.875 2.5 C-30.11031762 -8.01434093 -12.17299054 -8.11532703 0 0 Z " fill="#000000" transform="translate(294.1875,115.125)"/>
</svg>`;

    Object.assign(el.style, {
      padding: '4px',
      cursor: 'pointer',
      background: 'transparent',
      border: 'none',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: '8px',
      transition: 'opacity 0.2s ease, transform 0.2s ease'
    });

    // Hover effect: slight scale and opacity change
    el.onmouseenter = () => {
      el.style.opacity = '0.7';
      el.style.transform = 'translateY(-1px)';
    };
    el.onmouseleave = () => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    };

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
