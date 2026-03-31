// Sets sane defaults for Ads Library helper on install if they don't exist yet.
chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.sync.get(['country', 'media_type', 'context_menu_enabled', 'omnibox_enabled', 'meta_downloader_enabled'], (result) => {
    const toSet = {};
    if (!result.country) toSet.country = 'DEFAULT';
    if (!result.media_type) toSet.media_type = 'all';
    if (result.context_menu_enabled === undefined) toSet.context_menu_enabled = true;
    if (result.omnibox_enabled === undefined) toSet.omnibox_enabled = true;
    if (result.meta_downloader_enabled === undefined) toSet.meta_downloader_enabled = true;

    if (Object.keys(toSet).length) {
      chrome.storage.sync.set(toSet);
    }

    // Initialize/Create context menu if enabled default
    if (result.context_menu_enabled !== false) {
      createContextMenu();
    }
  });
});






// Meta Ads Library URL template with dynamic searchType and mediaType
const URL_TEMPLATE = "https://www.facebook.com/ads/library/"
  + "?active_status=active&ad_type=all"
  + "&country=${country}"
  + "&search_type=${searchType}"
  + "&media_type=${mediaType}"
  + "${days}"
  + "&q=${query}";

// Extract days parameters from query if present (e.g., "-14d -7d" -> [14, 7])
function extractDaysParameters(query) {
  const matches = Array.from(query.matchAll(/-(\d+)d\b/g));
  if (matches.length === 0) return null;
  if (matches.length === 1) {
    // If only one parameter, use it as max and today as min
    return {
      min: 0,
      max: parseInt(matches[0][1])
    };
  }
  // Sort numbers in descending order to get max and min correct
  const days = matches.map(m => parseInt(m[1])).sort((a, b) => b - a);
  return {
    min: days[1], // smaller number
    max: days[0]  // larger number
  };
}

// Format date in YYYY-MM-DD format
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Build the days parameter string for the URL
function buildDaysParameter(daysObj) {
  if (!daysObj) return '';

  const now = new Date();
  const minDate = new Date();
  const maxDate = new Date();

  // Calculate dates
  minDate.setDate(now.getDate() - daysObj.max); // Earlier date
  maxDate.setDate(now.getDate() - daysObj.min); // Later date

  return `&start_date[min]=${formatDate(minDate)}&start_date[max]=${formatDate(maxDate)}`;
}

function getCountry() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ country: 'DEFAULT' }, (items) => resolve(items.country));
  });
}

function getMediaType() {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ media_type: 'all' }, (items) => resolve(items.media_type));
  });
}

// If the user includes quotes anywhere, force exact phrase search type
function getSearchType(raw) {
  return /["“”]/.test(raw) ? "keyword_exact_phrase" : "keyword_unordered";
}

function buildUrl(query, country, mediaType) {
  const searchType = getSearchType(query || "");
  const normalizedCountry = country && country !== 'DEFAULT' ? country : 'ALL';

  // Extract days parameters and clean query
  const days = extractDaysParameters(query || "");
  const cleanQuery = (query || '').replace(/-\d+d\b/g, '').trim();

  // keep user quotes; Ads Library understands "%22...%22"
  const q = encodeURIComponent(cleanQuery);
  const c = encodeURIComponent(normalizedCountry);
  const m = encodeURIComponent(mediaType || 'all');
  const d = buildDaysParameter(days);

  return URL_TEMPLATE
    .replace("${country}", c)
    .replace("${searchType}", searchType)
    .replace("${mediaType}", m)
    .replace("${days}", d)
    .replace("${query}", q);
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (ch) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[ch]));
}


// Open options page on extension icon click
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});


// ---- CONTEXT MENU FOR SELECTED TEXT ----
function createContextMenu() {
  chrome.contextMenus.create({
    id: "searchAdsLibrary",
    title: 'Search Ads Library for "%s"',
    contexts: ["selection"]
  }, () => {
    // Ignore error if menu already exists
    if (chrome.runtime.lastError) { }
  });
}

function removeContextMenu() {
  chrome.contextMenus.remove("searchAdsLibrary", () => {
    if (chrome.runtime.lastError) { }
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "searchAdsLibrary" && info.selectionText) {
    const query = `"${info.selectionText.trim()}"`;
    const country = await getCountry();
    const mediaType = await getMediaType();
    const url = buildUrl(query, country, mediaType);
    chrome.tabs.create({ url, active: true });
  }
});

// Listen for settings changes to toggle Context Menu
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.context_menu_enabled) {
    if (changes.context_menu_enabled.newValue) {
      createContextMenu();
    } else {
      removeContextMenu();
    }
  }
});


// ---- OMNIBOX INPUT HANDLER (@ads <query>) ----
chrome.omnibox.onInputEntered.addListener(async (text) => {
  // If user just types "@ads" without query, open the library
  // (though usually they hit space then type query)
  const query = (text || "").trim();

  const country = await getCountry();
  const mediaType = await getMediaType();

  // If query is empty, maybe just open the library home? 
  // But let's assume they want to search "something" or if empty just open the page.
  const searchUrl = buildUrl(query, country, mediaType);

  chrome.tabs.create({ url: searchUrl });
});

// Listener for the floating Search Button
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SEARCH_ADS_LIBRARY") {
    (async () => {
      const country = await getCountry();
      const mediaType = await getMediaType();
      const searchUrl = buildUrl(request.query || "", country, mediaType);
      chrome.tabs.create({ url: searchUrl, active: true });
    })();
    return true; // Keep message channel open for async response if needed (though we don't send one presently)
  }
});
