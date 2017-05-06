![image](https://cloud.githubusercontent.com/assets/2539761/25288498/197cfc4e-269c-11e7-923f-7e83fcd595ac.png)

# QA Instances - Chrome Extension

This extension injects assets and HTML into Github PR pages.
The API server is [here](https://github.com/minervaproject/qa-instances-api).

# Local development

- Set the LOCAL boolean in config.js.
- Go to `chrome://extensions`, check "Developer mode", click "Load unpacked extension..." and choose this repo. Reload `chrome://extensions` to get updates.

*Gotcha*: if you want to add a new asset to the chain of dependencies that are loaded on a Github page, you'll need to update the appropriate `content_scripts` entry in `manifest.json` _and_ you'll need to add the asset to `background.js`. 
_`content_scripts` are loaded when a page matching the glob is loaded, but won't load those assets on URL state changes that aren't also full page loads (as are common in single page apps), so transitions from /pulls to /pull/:prId and back would would be missed. `background.js` listens for these URL state changes and injects those same assets manually, so it also needs to know about your dependencies._