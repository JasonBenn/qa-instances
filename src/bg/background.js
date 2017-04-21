var PULLS = /.*:\/\/github.com\/minervaproject\/.*\/pulls/
var PULL = /.*:\/\/github.com\/minervaproject\/.*\/pull\/.*/

console.log('connecting...');
var socket = io.connect('https://qa-instance-coordinator.minervaproject.com/');

socket.on('pulls', function(msg){
  console.log('pulls message:', msg);
});

socket.on('pull', function(msg){
  console.log('pull message:', msg);
});

chrome.webNavigation.onHistoryStateUpdated.addListener(_.throttle(function(details) {
  if (PULLS.test(details.url)) {
    chrome.tabs.executeScript(details.tabId, { file: "js/jquery/jquery.min.js" }, function() {
      chrome.tabs.executeScript(details.tabId, { file: "js/underscore/underscore-min.js" }, function() {
        chrome.tabs.executeScript(details.tabId, { file: "src/utils.js" }, function() {
          chrome.tabs.executeScript(details.tabId, { file: "src/inject/pulls.js" });
        });
      });
    });
    chrome.tabs.insertCSS(details.tabId, { file: "src/inject/pulls.css" });
  } else if (PULL.test(details.url)) {
    chrome.tabs.executeScript(details.tabId, { file: "js/jquery/jquery.min.js" }, function() {
      chrome.tabs.executeScript(details.tabId, { file: "js/underscore/underscore-min.js" }, function() {
        chrome.tabs.executeScript(details.tabId, { file: "src/utils.js" }, function() {
          chrome.tabs.executeScript(details.tabId, { file: "src/inject/pull.js" });
        });
      });
    });
    chrome.tabs.insertCSS(details.tabId, { file: "src/inject/pull.css" });

  }
}, 3000));

//example of using a message handler from the inject scripts
// chrome.extension.onMessage.addListener(
//   function(request, sender, sendResponse) {
//   	chrome.pageAction.show(sender.tab.id);
//     sendResponse();
//   });