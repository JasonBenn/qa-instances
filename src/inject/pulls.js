var socket = io.connect(BASE_URL);
monkeyPatchWebsocketClient(socket)

function render(prId, template, state, domainName) {
  var args

  if (state === "starting" || state === "stopping") {
    args = { color: "yellow", url: getUrlOfBottomOfPrPage(prId) }

  } else if (state === "error") {
    args = { color: "red", url: getUrlOfBottomOfPrPage(prId) }

  } else if (state === "online") {
    var url = domainName + "/app/login"
    args = { color: "green", url: url }
  }

  $('#issue_' + prId + ' > .d-table').append(template(args))
}

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
  	if (document.readyState === "complete") {
  		clearInterval(readyStateCheckInterval)

      var prsPromise = $.get(BASE_URL + '/pulls')
      var badgePromise = getTemplate('badge')

      $.when(prsPromise, badgePromise).done(function(prs, template) {
        prs[0].data.forEach(function(pr) {
          render(pr.prId, template, pr.overallState, pr.domainName)
        })
        
        socket.on('*', function(channel, rawMessage) {
          var message = JSON.parse(rawMessage)
          var prId = /\d+$/.exec(channel)[0]
          var state = message.overallState
          var domainName = message.domainName

          if (state || domainName) {
            console.log('ps:', channel, message)
            render(prId, template, state, domainName)
          }
        })
      })

  	}
	}, 10);
});
