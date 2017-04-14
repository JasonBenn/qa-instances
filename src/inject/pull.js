function getPrId() {
  return /.../.exec(location.href)
}

function getLatestSha() {

}

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

    // GET pull with current PR
    // IF pull exists:
      // RENDER current

    // var startButton = chrome.runtime.getFromUrl('src/templates/')
    // console.log(startButton);
    // window.startButton = startButton

		console.log("This is a single Minerva PR!");

	}
	}, 10);
});