var socket = io.connect(BASE_URL);
monkeyPatchWebsocketClient(socket)

var state = {}

var initialPrState = {
  overallState: "",
  domainName: ""
}

function render(prId, template) {
  var color, url
  var pr = state[prId]

  if (pr.overallState === States.Online) {
    url = "https://" + pr.domainName
  } else {
    url = getUrlOfBottomOfPrPage(prId)
  }

  if (pr.overallState === "starting" || pr.overallState === "stopping") {
    color = "yellow"
  } else if (pr.overallState === "error") {
    color = "red"
  } else if (pr.overallState === "online") {
    color = "green"
  }

  $('#issue_' + prId + ' > .d-table').append(template({ url: url, color: color }))
}

function updateStateAndRender(template, prId, prData) {
  // Filter out any key/value pairs with undefined values.
  var stateUpdates = _.omit(prData, _.isUndefined)
  state[prId] = state[prId] || _.extend({}, initialPrState)
  _.extend(state[prId], stateUpdates)
  render(prId, template)
}

chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
  	if (document.readyState === "complete") {
  		clearInterval(readyStateCheckInterval)

      var prsPromise = $.get(BASE_URL + '/pulls')
      var badgePromise = getTemplate('badge')

      $.when(prsPromise, badgePromise).done(function(prs, template) {
        var boundUpdateAndRender = updateStateAndRender.bind(this, template)

        prs[0].data.forEach(function(pr) {
          boundUpdateAndRender(pr.prId, { overallState: pr.overallState, domainName: pr.domainName })
        })
        
        function onMessage(template, channel, rawMessage) {
          var prId = /\d+$/.exec(channel)[0]
          var msg = JSON.parse(rawMessage)

          if (msg.overallState || msg.domainName) {
            console.log('ps:', channel, msg)
            boundUpdateAndRender(prId, { overallState: msg.overallState, domainName: msg.domainName })
          }
        }

        socket.on('*', onMessage.bind(this, template))
      })

  	}
	}, 10);
});
