(function () {
  const hostname = window.location.hostname;

  // Check if disabled on this page
  chrome.storage.local.get(['grab_ads_hidden_domains'], (result) => {
    const hiddenDomains = result.grab_ads_hidden_domains || [];
    if (hiddenDomains.includes(hostname)) return;
    
    // Do not show on Ads Library or Shopify Admin
    const href = window.location.href;
    if (href.includes('facebook.com/ads/library') || href.includes('admin.shopify.com')) {
      return;
    }

    if (document.getElementById('grab-ads-search-wrapper')) return;

    // Wrapper Container
    const wrapper = document.createElement('div');
    wrapper.id = 'grab-ads-search-wrapper';
    Object.assign(wrapper.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '2147483647',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
      pointerEvents: 'none'
    });

    // Close Button (X)
    const closeBtn = document.createElement('div');
    closeBtn.id = 'grab-ads-close-btn';
    closeBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    Object.assign(closeBtn.style, {
      backgroundColor: '#333',
      color: '#fff',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      opacity: '0',
      transition: 'opacity 0.3s ease, transform 0.2s ease',
      pointerEvents: 'auto',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    });

    // Hide Menu
    const hideMenu = document.createElement('div');
    Object.assign(hideMenu.style, {
      backgroundColor: '#fff',
      border: '1px solid #eee',
      borderRadius: '12px',
      padding: '8px',
      display: 'none',
      flexDirection: 'column',
      gap: '4px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      pointerEvents: 'auto',
      width: 'max-content',
      marginBottom: '4px'
    });

    const createMenuBtn = (text, onClick) => {
      const b = document.createElement('button');
      b.innerText = text;
      Object.assign(b.style, {
        border: 'none',
        backgroundColor: 'transparent',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500',
        textAlign: 'left',
        cursor: 'pointer',
        color: '#333',
        transition: 'background-color 0.2s ease'
      });
      b.onmouseenter = () => b.style.backgroundColor = '#f5f5f5';
      b.onmouseleave = () => b.style.backgroundColor = 'transparent';
      b.onclick = onClick;
      return b;
    };

    const hideNowBtn = createMenuBtn('Hide for now', () => {
      wrapper.remove();
    });

    const hideAlwaysBtn = createMenuBtn(`Hide always on this site`, () => {
      // 1. Hide search UI
      wrapper.style.display = 'none';
      
      // 2. Add to storage
      chrome.storage.local.get(['grab_ads_hidden_domains'], (res) => {
        const domains = res.grab_ads_hidden_domains || [];
        if (!domains.includes(hostname)) {
          domains.push(hostname);
          chrome.storage.local.set({ 'grab_ads_hidden_domains': domains });
        }
      });

      // 3. Show Undo Toast
      const undoToast = document.createElement('div');
      Object.assign(undoToast.style, {
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: '2147483647',
        backgroundColor: '#333',
        color: '#fff',
        padding: '12px 16px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        fontSize: '13px',
        fontWeight: '500',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      });
      undoToast.innerHTML = `<span>Site Hidden Always</span>`;
      
      const undoBtn = document.createElement('button');
      undoBtn.innerText = 'Undo';
      Object.assign(undoBtn.style, {
        backgroundColor: '#fff',
        color: '#000',
        border: 'none',
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '11px',
        fontWeight: '700',
        cursor: 'pointer',
        textTransform: 'uppercase'
      });
      
      let isUndone = false;
      undoBtn.onclick = () => {
        isUndone = true;
        chrome.storage.local.get(['grab_ads_hidden_domains'], (res) => {
          const domains = res.grab_ads_hidden_domains || [];
          const index = domains.indexOf(hostname);
          if (index > -1) {
            domains.splice(index, 1);
            chrome.storage.local.set({ 'grab_ads_hidden_domains': domains }, () => {
              undoToast.remove();
              wrapper.style.display = 'flex';
              hideMenu.style.display = 'none';
            });
          }
        });
      };
      
      undoToast.appendChild(undoBtn);
      document.body.appendChild(undoToast);
      
      // 4. Auto-remove toast and search UI
      setTimeout(() => {
        if (!isUndone) {
          undoToast.remove();
          wrapper.remove();
        }
      }, 5000);
    });

    hideMenu.appendChild(hideNowBtn);
    hideMenu.appendChild(hideAlwaysBtn);

    closeBtn.onclick = (e) => {
      e.stopPropagation();
      const isVisible = hideMenu.style.display === 'flex';
      hideMenu.style.display = isVisible ? 'none' : 'flex';
    };

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) {
        hideMenu.style.display = 'none';
      }
    });

    // Search Button
    const searchBtn = document.createElement('a');
    searchBtn.id = 'grab-ads-search-btn';
    searchBtn.href = '#';
    Object.assign(searchBtn.style, {
      backgroundColor: '#000',
      color: '#fff',
      padding: '10px',
      borderRadius: '999px',
      fontSize: '14px',
      fontWeight: '600',
      textDecoration: 'none',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '0px',
      pointerEvents: 'auto',
      userSelect: 'none'
    });

    const textNode = document.createElement('span');
    textNode.innerText = 'Search on Ads Library';
    Object.assign(textNode.style, {
      maxWidth: '0px',
      opacity: '0',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      transition: 'max-width 0.3s ease, opacity 0.3s ease'
    });
    searchBtn.appendChild(textNode);

    const icon = document.createElement('div');
    icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;
    icon.style.display = 'flex';
    icon.style.alignItems = 'center';
    icon.style.justifyContent = 'center';
    icon.style.flexShrink = '0';
    searchBtn.prepend(icon);

    searchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const query = hostname.replace(/^www\./, '');
      try {
        if (!chrome.runtime?.id) throw new Error("Extension context invalidated.");
        chrome.runtime.sendMessage({ type: "SEARCH_ADS_LIBRARY", query: query });
      } catch (err) {
        console.warn("Ads Grabber: Please refresh the page.", err);
        window.open(`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&q=${encodeURIComponent(query)}&search_type=keyword_unordered&media_type=all`, '_blank');
      }
    });

    wrapper.addEventListener('mouseenter', () => {
      closeBtn.style.opacity = '1';
      searchBtn.style.transform = 'translateY(-2px)';
      searchBtn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    });
    
    wrapper.addEventListener('mouseleave', () => {
      if (hideMenu.style.display === 'flex') return;
      closeBtn.style.opacity = '0';
      searchBtn.style.transform = 'translateY(0)';
      searchBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    });

    searchBtn.addEventListener('mouseenter', () => {
      searchBtn.style.padding = '10px 16px';
      searchBtn.style.gap = '8px';
      textNode.style.maxWidth = '200px';
      textNode.style.opacity = '1';
    });

    searchBtn.addEventListener('mouseleave', () => {
      searchBtn.style.padding = '10px';
      searchBtn.style.gap = '0px';
      textNode.style.maxWidth = '0px';
      textNode.style.opacity = '0';
    });

    wrapper.appendChild(hideMenu);
    wrapper.appendChild(closeBtn);
    wrapper.appendChild(searchBtn);

    // Wait for body to be available
    const inject = () => {
      if (document.body) {
        document.body.appendChild(wrapper);
      } else {
        setTimeout(inject, 100);
      }
    };
    inject();
  });
})();



