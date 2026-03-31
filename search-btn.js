(function() {
  if (document.getElementById('grab-ads-search-btn')) return;

  // Do not show on Ads Library or Shopify Admin
  const href = window.location.href;
  if (href.includes('facebook.com/ads/library') || href.includes('admin.shopify.com')) {
    return;
  }

  const btn = document.createElement('a');
  btn.id = 'grab-ads-search-btn';
  btn.href = '#';
  btn.innerText = 'Search on Ads Library';

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const query = window.location.hostname.replace(/^www\./, '');
    
    try {
      if (!chrome.runtime?.id) throw new Error("Extension context invalidated.");
      // Send message to background to utilize omnibox logic
      chrome.runtime.sendMessage({ type: "SEARCH_ADS_LIBRARY", query: query });
    } catch (err) {
      console.warn("Ads Grabber: Please refresh the page. The extension was reloaded.", err);
      // Fallback: manually open a basic search url
      window.open(`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&q=${encodeURIComponent(query)}&search_type=keyword_unordered&media_type=all`, '_blank');
    }
  });
  
  Object.assign(btn.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '2147483647', // Max z-index to ensure it stays on top
    backgroundColor: '#000',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  });

  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-2px)';
    btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
  });
  
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0)';
    btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  });

  const icon = document.createElement('div');
  icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
  icon.style.display = 'flex';
  icon.style.alignItems = 'center';
  
  btn.prepend(icon);

  // Wait for body to be available
  const inject = () => {
    if (document.body) {
      document.body.appendChild(btn);
    } else {
      setTimeout(inject, 100);
    }
  };
  
  inject();
})();
