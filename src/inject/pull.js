function getPrId() {
  return /\/(\d+)$/.exec(location.href)[1]
}

function getLatestSha() {
  return "acefee"
}

function render(html) {
  $('.pulls-wrapper').html(html)
}

chrome.extension.sendMessage({}, function(response) {

  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      var prStatusPromise = $.get('https://qa-instance-coordinator.minervaproject.com/pulls/' + getPrId())

      var wrapperPromise = getTemplate('pulls-wrapper')
      wrapperPromise.done(function(template) {
        $('.mergeability-details .branch-action-item').last().after(template())
      })

      // ON message: render

      prStatusPromise.done(function(data) { 
        console.log(data, _.size(data));
        if (!_.size(data)) {
          getTemplate("current").done(function(template) {
            var html = template({
              newerShaAvailable: true, // getLatestSha() !== data.sha,
              url: "https://qa-features-lo-detail-page.minervaproject.com",
              oldCommitSha: "c4c82e1",
              oldCommitUrl: "https://github.com/minervaproject/picasso/pull/2187/commits/c4c82e13295f3e73d77c6a7659598f3dbf4b9487",
              newCommitSha: "6085a62",
              newCommitUrl: "https://github.com/minervaproject/picasso/pull/2283/commits/6085a62e8f9ae0a365f4b16bac89a6e223ccea02"
            })
            render(html)
          })
        } else {
          getTemplate("create").done(function(template) {
            render(template())
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