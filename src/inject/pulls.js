var socket = io.connect(BASE_URL);
monkeyPatchWebsocketClient(socket)

function render(prId, template, state, domainName) {
  var args

  if (state === "starting" || state === "stopping") {
    args = { color: "yellow", domainName: getUrlOfBottomOfPrPage(prId) }

  } else if (state === "error") {
    args = { color: "red", domainName: getUrlOfBottomOfPrPage(prId) }

  } else if (state === "online") {
    args = { color: "green", domainName: "https://" + domainName }
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
        
        function onMessage(template, channel, rawMessage) {
          var message = JSON.parse(rawMessage)
          var prId = /\d+$/.exec(channel)[0]
          var state = message.overallState
          var domainName = message.domainName

          if (state || domainName) {
            console.log('ps:', channel, message)
            render(prId, template, state, domainName)
          }
        }

        socket.on('*', onMessage.bind(this, template))
      })

  	}
	}, 10);
});
