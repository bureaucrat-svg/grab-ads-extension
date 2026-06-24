# Ads Grabber

A tiny, powerful helper for the Meta Ads Library that saves you clicks and time. Features a minimalist, intuitive design.

## Features

- **Omnibox shortcut**: Type `@ads` in the Chrome address bar + any URL → extracts the domain and searches it on Meta Ads Library.
- **Exact phrase search**: Put your query in quotes and it switches to exact match automatically for Meta Ads Library context menu.
- **Date filtering**: Add `-7d` for last 7 days or `-14d -7d` for custom ranges in Meta Ads Library context menu.
- **Right‑click search**: Select text on any page → right-click → "Search Ads Library for ...".
- **Media type filter**: Choose All, Video, Image, or Image + Meme in the options, and it includes the filter in Meta Ads Library searches.
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
- Type: `@ads` + Space + any URL, then Enter.  
  Example: `@ads https://example.com/shoes`
  This will extract `example.com` and open the Meta Ads Library for that domain.

### 2) From any page
- Select text, right‑click → “Search Ads Library for "..."”.

### 3) Settings (Options page)
Open from the extension menu (Options) or `chrome://extensions` → Details → Extension options.
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
- `content-filter.js` – Enforces default media type filter on the Meta Ads Library page.
- `meta-ads-downloader.js` – Injects download buttons on creatives within the Ads Library.
- `options.html` & `options.js` – Settings UI (media type, theme toggle).

---

## Quick examples

```text
@ads https://example.com/foo    → extracts example.com and searches Meta Ads Library
Select text → right‑click → search that phrase on Meta Ads Library
```

Have fun and happy hunting!
