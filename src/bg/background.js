var PULLS = /.*:\/\/github.com\/minervaproject\/picasso\/pulls/
var PULL = /.*:\/\/github.com\/minervaproject\/picasso\/pull\/.*/

console.log('ps: connecting to', BASE_URL);
var socket = io.connect(BASE_URL);
monkeyPatchWebsocketClient(socket)


var connectedTabs = []

// Gah, this is tricky.
// Can't be a dict by channel, because then a second tab of the same page wouldn't get updates.
// If I'm going to register every tab that opens, then I'll have duplicates.
// Probably easiest to connect and disconnect every client, and send messages to every tab.
// Was there a problem with this? Right - I think it was that the client was connecting and adding listeners way more than it was disconnecting.

chrome.runtime.onConnect.addListener(function(port) {
  console.log('Tab connected', port.name)
  connectedTabs.push(port)
  port.onDisconnect.addListener(function(disconnectingPort) {
    console.log('Tab disconnected', port.name)
    connectedTabs = _.reject(connectedTabs, function(port) { return port === disconnectingPort })
  })
})

socket.on('*', function(channel, message) {
  _.values(connectedTabs).forEach(function(port) {
    port.postMessage({ channel: channel, message: message })
  })
})


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
