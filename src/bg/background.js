var PULLS = /.*:\/\/github.com\/minervaproject\/.*\/pulls/
var PULL = /.*:\/\/github.com\/minervaproject\/.*\/pull\/.*/

// Inject JS/CSS on URL updates, because Github is a single-page app.
// These files should match the content_scripts in manifest.json.
chrome.webNavigation.onHistoryStateUpdated.addListener(_.throttle(function(details) {
  if (PULLS.test(details.url)) {
    chrome.tabs.executeScript(details.tabId, { file: "js/socket.io.js" }, function() {
      chrome.tabs.executeScript(details.tabId, { file: "js/jquery/jquery.min.js" }, function() {
        chrome.tabs.executeScript(details.tabId, { file: "js/underscore/underscore-min.js" }, function() {
          chrome.tabs.executeScript(details.tabId, { file: "src/config.js" }, function() {
            chrome.tabs.executeScript(details.tabId, { file: "src/utils.js" }, function() {
              chrome.tabs.executeScript(details.tabId, { file: "src/inject/pulls.js" });
            });
          });
        });
      });
    });
    chrome.tabs.insertCSS(details.tabId, { file: "src/inject/pulls.css" });
  } else if (PULL.test(details.url)) {
    chrome.tabs.executeScript(details.tabId, { file: "js/socket.io.js" }, function() {
      chrome.tabs.executeScript(details.tabId, { file: "js/jquery/jquery.min.js" }, function() {
        chrome.tabs.executeScript(details.tabId, { file: "js/underscore/underscore-min.js" }, function() {
          chrome.tabs.executeScript(details.tabId, { file: "src/config.js" }, function() {
            chrome.tabs.executeScript(details.tabId, { file: "src/utils.js" }, function() {
              chrome.tabs.executeScript(details.tabId, { file: "src/inject/pull.js" });
            });
          });
        });
      });
    });
    chrome.tabs.insertCSS(details.tabId, { file: "src/inject/pull.css" });

  }
}, 3000));
