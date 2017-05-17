var socket = io.connect(BASE_URL);
monkeyPatchWebsocketClient(socket)

function render(prId, template, state, domainName) {
  var color, url

  if (state === States.Online) {
    url = "https://" + domainName
  } else {
    url = getUrlOfBottomOfPrPage(prId)
  }

  if (state === "starting" || state === "stopping") {
    color = "yellow"
  } else if (state === "error") {
    color = "red"
  } else if (state === "online") {
    color = "green"
  }

  $('#issue_' + prId + ' > .d-table').append(template({ url: url, color: color }))
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
