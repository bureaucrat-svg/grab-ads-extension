// Unified Content Filter for Meta Ads Library
// Replaces content-country.js and content-mediatype.js to prevent conflicts

(function () {
    let lastUrl = window.location.href;
    let lastAppliedUrl = null;
    let observer;
    let originalPushState;
    let originalReplaceState;
    let handleUrlChange = () => { };
    let started = false;

    function start() {
        if (started) return;
        started = true;
        originalPushState = history.pushState;
        originalReplaceState = history.replaceState;

        // Debounce helper to prevent rapid firing
        function debounce(func, wait) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        function applyFilters() {
            // Only run on Ads Library pages
            if (!window.location.href.includes('/ads/library')) return;

            chrome.storage.sync.get(['country', 'media_type'], function (result) {
                const defaultCountry = result.country || 'DEFAULT';
                const defaultMediaType = result.media_type || 'all';
                const appliedKey = '__ads_grabber_filters_applied__';
                const appliedFingerprint = `${window.location.href}|${defaultCountry}|${defaultMediaType}`;
                if (sessionStorage.getItem(appliedKey) === appliedFingerprint) {
                    return;
                }

                const url = new URL(window.location.href);
                const params = new URLSearchParams(url.search);
                let needsUpdate = false;

                // Special case for ID lookup
                if (params.has('id')) {
                    if (!params.has('country') || params.get('country') !== 'ALL') {
                        params.set('country', 'ALL');
                        needsUpdate = true;
                    }
                    if (!params.has('active_status') || params.get('active_status') !== 'all') {
                        params.set('active_status', 'all');
                        needsUpdate = true;
                    }
                    if (!params.has('media_type') || params.get('media_type') !== 'all') {
                        params.set('media_type', 'all');
                        needsUpdate = true;
                    }
                } else {
                    // 1. Country Filter
                    const hasCountryParam = params.has('country');
                    if (defaultCountry !== 'DEFAULT' && !hasCountryParam) {
                        params.set('country', defaultCountry);
                        needsUpdate = true;
                    }

                    // 2. Media Type Filter
                    const hasMediaTypeParam = params.has('media_type');
                    if (defaultMediaType !== 'all' && !hasMediaTypeParam) {
                        params.set('media_type', defaultMediaType);
                        needsUpdate = true;
                    }
                }

                // Apply changes if needed
                if (needsUpdate) {
                    const query = params.toString();
                    const newUrl = query ? `${url.origin}${url.pathname}?${query}` : `${url.origin}${url.pathname}`;
                    if (window.location.href !== newUrl && lastAppliedUrl !== newUrl) {
                        console.log('[Grab Ads] Applying filters:', newUrl);
                        lastAppliedUrl = newUrl;
                        sessionStorage.setItem(appliedKey, `${newUrl}|${defaultCountry}|${defaultMediaType}`);
                        window.location.replace(newUrl);
                    }
                } else {
                    sessionStorage.setItem(appliedKey, appliedFingerprint);
                }
            });
        }

        const debouncedApplyFilters = debounce(applyFilters, 200);

        handleUrlChange = function () {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                lastAppliedUrl = null;
            }
            debouncedApplyFilters();
        };

        // Hook into History API
        history.pushState = function () {
            const result = originalPushState.apply(this, arguments);
            handleUrlChange();
            return result;
        };

        history.replaceState = function () {
            const result = originalReplaceState.apply(this, arguments);
            handleUrlChange();
            return result;
        };

        window.addEventListener('popstate', handleUrlChange);

        // Run on initial load
        handleUrlChange();

        observer = new MutationObserver(() => {
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                handleUrlChange();
            }
        });

        if (document.body) {
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, { childList: true, subtree: true });
            });
        }
    }

    // Initialize immediately without auth checks
    start();
})();
