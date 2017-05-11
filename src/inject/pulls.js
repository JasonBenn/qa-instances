var socket = io.connect(BASE_URL);
monkeyPatchWebsocketClient(socket)

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
  	if (document.readyState === "complete") {
  		clearInterval(readyStateCheckInterval);

      var prsPromise = $.get(BASE_URL + '/pulls')
      var badgePromise = getTemplate('badge')

      $.when(prsPromise, badgePromise).done(function(prs, template) {
        prs[0].data.forEach(function(pr) {
          var args

          if (pr.overallState === "starting" || pr.overallState === "stopping") {
            args = { color: "yellow", url: "#" }

          } else if (pr.overallState === "online") {
            var url = pr.domainName + "/app/login"
            args = { color: "green", url: url }
          }

          $('#issue_' + pr.prId + ' > .d-table').append(template(args))
        })
      })

      // TODO: real time updates to this page.
      // socket.on('*', function(message) {
        // console.log('ps:', message);
        // updateStateAndRender(JSON.parse(message))
      // })

  	}
	}, 10);
});
