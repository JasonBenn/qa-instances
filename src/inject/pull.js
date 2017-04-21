function getPrId() {
  return /\/(\d+)$/.exec(location.href)[1]
}

function getLatestSha() {
  return "acefee"
}

chrome.extension.sendMessage({}, function(response) {

  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      var prStatusPromise = $.get('https://qa-instance-coordinator.minervaproject.com/pulls/' + getPrId())
      prStatusPromise.done(function(data) { 
        console.log(data, _.size(data));
        if (_.size(data)) {
          getTemplate("create").done(function(template) {
            console.log('create');
          })
        } else {
          getTemplate("current").done(function(template) {
            var html = template({
              newerShaAvailable: false, // getLatestSha() !== data.sha,
              url: "https://qa-features-lo-detail-page.minervaproject.com"
            })
            $('.mergeability-details .branch-action-item').last().after(html)
          })
        }
      })

      // GET pull with current PR
      // IF pull exists:
        // RENDER current

      // var startButton = chrome.runtime.getFromUrl('src/templates/')
      // console.log(startButton);
      // window.startButton = startButton

  	}
	}, 10);
});