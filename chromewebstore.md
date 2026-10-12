# Chrome Web Store Justification

This document outlines the permissions required by the Grab Ads extension and their justifications for the review process.

## Permissions

### `activeTab`
**Justification**: Required to allow the user to trigger extension actions on the current tab, such as opening the options page or other active tab features.

### `storage`
**Justification**: Necessary to store user preferences locally, including:
- Preferred media type filter (All, Image, Video).
- Feature toggles (e.g., Enable/Disable Meta Ads Downloader).

### `contextMenus`
**Justification**: Used to add a "Search Ads Library for..." item to the browser's context menu. This allows users to quickly search selected text on the Ads Library directly.

### Host Permissions: `https://www.facebook.com/ads/library*`
**Justification**: The core functionality of the extension is to enhance the Meta Ads Library interface. This permission is required to:
- Inject content scripts to automatically apply search filters.
- Inject `meta-ads-downloader.js` to add download buttons to ad creatives directly on the page.

### `omnibox`
**Keyword**: `@ads`
**Justification**: Adds a keyword to the Chrome address bar, allowing users to quickly extract the domain from a URL and search the Meta Ads Library by typing `@ads <url>`.

## Data Usage
The extension functions entirely client-side. No user data is collected, stored on external servers, or shared with third parties. All `storage` usage is local to the user's browser instance.
