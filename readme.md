# MeWhat it does (short and sweet):
- Omnibox### 2) From any page
- Click the extension's icon → opens Ads Library and searches for the current site's full hostname (including subdomains).
- Or select text, right‑click → "Search Ads Library for "…"".ortcut: type `ads` in the Chrome address bar + your query → jump straight to Ads Library.
- Exact phrase search: put your query in quotes and we switch to exact match automatically.
- Date filtering: add `-7d` for last 7 days or `-14d -7d` for custom ranges.
- Toolbar button: click it on any site to search Ads Library for that site's domain.
- Right‑click search: select text on any page → "Search Ads Library for …".
- Media type filter: choose All, Video, Image, or Image + Meme and we include it in every search.
- Downloader: quick download buttons on ad images and videos inside the library.
- Dark mode: slick options page with a header toggle (default is dark).

A tiny helper for the Meta Ads Library that saves you clicks and time.

What it does (short and sweet):
- Omnibox shortcut: type `ads` in the Chrome address bar + your query → jump straight to Ads Library.
- Exact phrase search: put your query in quotes and we switch to exact match automatically.
- Toolbar button: click it on any site to search Ads Library for that site’s domain.
- Right‑click search: select text on any page → “Search Ads Library for …”.
- Media type filter: choose All, Video, Image, or Image + Meme and we include it in every search.
- Downloader: quick download buttons on ad images and videos inside the library.
- Dark mode: slick options page with a header toggle (default is dark).

---

## Install
1) Download/clone this repo.  
2) Open `chrome://extensions`  
3) Toggle on Developer mode  
4) Click “Load unpacked” and pick this folder

That’s it.

---

## How to use

### 1) From the address bar (Omnibox)
- Type: `ads` + Space + your keywords, then Enter.  
  Example: `ads nike shoes`
- Exact phrase: wrap it in quotes.  
  Example: `ads "bald spot"`
- Date filtering: add `-Nd` for last N days.  
  Example: `ads "shop now" -7d`
- Date ranges: use two parameters for a specific range.  
  Example: `ads "summer sale" -14d -7d` (shows ads from 14 to 7 days ago)

### 2) From any page
- Click the extension’s icon → opens Ads Library and searches for the current site’s domain.
- Or select text, right‑click → “Search Ads Library for "…"”.

### 3) Settings (Options page)
Open from the extension menu (Options) or `chrome://extensions` → Details → Extension options.
- Country: pick your default country (US by default).
- Media Type: All / Video / Image / Image + Meme (used in all searches).
- Theme: use the header toggle (🌙/☀️). Default is dark.

---

## Tips
- The omnibox shows a helpful hint while you type and recognizes quotes for exact search.
- Facebook domains are ignored for the domain search on purpose.
- We only ever send you to the official Meta Ads Library page.

---

## Files
- `manifest.json` – permissions, omnibox keyword, content scripts, background worker.
- `background.js` – omnibox logic, quote detection, domain search, install defaults.
- `content-country.js` – keeps your selected country applied on library pages.
- `content-downloader.js` – adds the download buttons on creatives.
- `options.html` / `options.js` – settings UI (country, media type, theme toggle).

---

## Quick examples
```text
ads protein powder     → library search for protein powder
ads "bald spot"        → exact phrase results
ads "shop now" -7d     → ads from last 7 days
ads "sale" -14d -7d    → ads from 14 to 7 days ago
Toolbar click on blog.nike.com → search for blog.nike.com
Toolbar click on shop.nike.com → search for shop.nike.com
Select text → right‑click → search that phrase
```

Have fun and happy hunting.
