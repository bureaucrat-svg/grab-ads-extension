# Ads Grabber

A tiny, powerful helper for the Meta Ads Library that saves you clicks and time. Features a minimalist, intuitive design.

## Features

- **Omnibox shortcut**: Type `@ads` in the Chrome address bar + your query → jump straight to the Ads Library.
- **Exact phrase search**: Put your query in quotes and it switches to exact match automatically.
- **Date filtering**: Add `-7d` for last 7 days or `-14d -7d` for custom ranges.
- **Toolbar button**: Click the extension icon on any site to search the Ads Library for that site's domain.
- **Right‑click search**: Select text on any page → right-click → "Search Ads Library for ...".
- **Media type filter**: Choose All, Video, Image, or Image + Meme in the options, and it includes the filter in every search.
- **Downloader**: Quick download buttons on ad images and videos directly inside the Meta Ads Library.
- **Dark mode**: Clean options page with a header toggle (default is dark theme).

---

## Install

1. Download or clone this repository.
2. Open `chrome://extensions` in your browser.
3. Toggle on **Developer mode** at the top right.
4. Click **Load unpacked** and select this extension's folder.

That's it!

---

## How to use

### 1) From the address bar (Omnibox)
- Type: `@ads` + Space + your keywords, then Enter.  
  Example: `@ads nike shoes`
- Exact phrase: wrap it in quotes.  
  Example: `@ads "bald spot"`
- Date filtering: add `-Nd` for last N days.  
  Example: `@ads "shop now" -7d`
- Date ranges: use two parameters for a specific range.  
  Example: `@ads "summer sale" -14d -7d` (shows ads from 14 to 7 days ago)

### 2) From any page
- Click the extension’s icon → opens Ads Library and searches for the current site’s full domain.
- Select text, right‑click → “Search Ads Library for "..."”.

### 3) Settings (Options page)
Open from the extension menu (Options) or `chrome://extensions` → Details → Extension options.
- **Country**: Pick your default country for searches (US by default).
- **Media Type**: All / Video / Image / Image + Meme (applied to all your searches).
- **Theme**: Use the toggle to switch between dark and light modes.

---

## Tips
- The omnibox shows a helpful hint while you type and recognizes quotes for exact search.
- Facebook domains are ignored for the domain search on purpose.
- You are only ever redirected to the official Meta Ads Library page.

---

## Architecture / Files
- `manifest.json` – Extension configuration, permissions, content scripts.
- `background.js` – Omnibox logic, context menus, and domain search handlers.
- `content-filter.js` – Enforces default country and filters on the Meta Ads Library page.
- `meta-ads-downloader.js` – Injects download buttons on creatives within the Ads Library.
- `search-btn.js` – Utility scripts injected on generic pages.
- `options.html` & `options.js` – Settings UI (country, media type, theme toggle).

---

## Quick examples

```text
@ads protein powder     → library search for protein powder
@ads "bald spot"        → exact phrase results
@ads "shop now" -7d     → ads from last 7 days
@ads "sale" -14d -7d    → ads from 14 to 7 days ago
Toolbar click on blog.nike.com → search for blog.nike.com
Toolbar click on shop.nike.com → search for shop.nike.com
Select text → right‑click → search that phrase
```

Have fun and happy hunting!
