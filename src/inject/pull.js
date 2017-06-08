var initialUIState = {
  // state part 1: UI-only state
  loading: false,
  sha: undefined,

  // state part 2: progress outputs from long-running API functions
  overallProgress: "",
  dbProgress: "",
  instanceProgress: "",
  deployInstanceProgress: "",
  route53Progress: "",
  startInstanceProgress: "",
  serviceInstanceProgress: "",

  // state part 3: all key-value pairs from relevant DB record
  overallState: "",
  dbState: "",
  instanceState: "",
  deployInstanceState: "",
  route53State: "",
  startInstanceState: "",
  serviceInstanceState: "",

  overallError: "",
  dbError: "",
  instanceError: "",
  deployInstanceError: "",
  route53Error: "",
  startInstanceError: "",
  serviceInstanceError: ""
}

var state = _.clone(initialUIState)

console.log('ps: connecting to', BASE_URL);
var socket = io.connect(BASE_URL);

function getPrId() {
  const numericSegment = /\/(\d+)(\/?|$)(#.*)?/
  const match = numericSegment.exec(location.href)
  if (match) return match[1]
}

function getPrName() {
  return $('.commit-ref').last().attr('title').split(':').slice(1).join(':')
}

function getLatestSha() {
  return $('.commit-id').last().text()
}

function listenForClickDestroy() {
  $('#qai-destroy').click(function() {
    state.loading = true
    render()
    ajaxDelete(BASE_URL + "/pulls/" + getPrId()).done(function() {
      state.loading = false
      render()
    })
  })
}

function listenForClickCreate() { 
  $("#qai-create").click(function() {
    state.loading = true
    render()
    ajaxPost(BASE_URL + "/pulls/", { 
      prId: getPrId(),
      prName: getPrName(),
      sha: getLatestSha()
    }).done(function(response) {
      var stateUpdates = _.extend({}, response.data, { loading: false })
      updateStateAndRender(stateUpdates)
    })
  })
}

function listenForClickUpdateDB() {
  $('#qai-update-db').click(function() {
    state.loading = true
    render()
    ajaxPost(BASE_URL + "/pulls/updateDB", { 
      prId: getPrId(),
    }).done(function(response) {
      state.loading = false
      render()
    })
  })
}

function listenForClickRedeploy() {
  $("#qai-redeploy").click(function() {
    state.loading = true
    render()
    ajaxPost(BASE_URL + "/pulls/redeploy", { 
      prId: getPrId(),
      sha: getLatestSha()
    }).done(function(response) {
      state.loading = false
      render()
    })
  })
}

function maybeRequestFailedLog() {
  if (state.deployInstanceState === States.Error
    || state.deployInstanceState === States.Starting
    || state.deployInstanceState === States.Error
    || state.serviceInstanceState === States.Stopping) {
    ajaxPost(BASE_URL + "/pulls/logs", {
      prId: getPrId()
    }).done(function(message) {
      if (message.data) appendLogUpdate(message.data)
    })
  }
}

function registerListeners() {
  listenForClickDestroy()
  listenForClickUpdateDB()
  listenForClickRedeploy()
  listenForClickCreate()
}

function render() {
  var templatePromise
  var overallState = state.overallState

  if (state.loading) {
    templatePromise = getTemplate("loading")

  } else if (overallState === States.Offline || !overallState) {
    templatePromise = getTemplate("offline")

  } else {
    templatePromise = getTemplate("online")
  }

  templatePromise.done(function(template) {
    // Mix in valid states from config.js.
    $('.qai-wrapper').html(template(_.extend({}, States, Helpers, state)))
    registerListeners()
  })
}

function logsToHTML(log) {
  return log.split('\n').map(function(line) {
    return "<pre>" + line + "</pre>"
  }).join("")
}

function appendLogUpdate(message) {
  var $logsContainer
  if (message.deployInstanceLog) {
    $logsContainer = $('#deployInstanceLogs')
    $logsContainer.append(logsToHTML(message.deployInstanceLog))
  } else if (message.serviceInstanceLog) {
    $logsContainer = $('#serviceInstanceLogs')
    $logsContainer.append(logsToHTML(message.serviceInstanceLog))
  }
  $logsContainer[0].scrollTop += 100000  // scroll to the bottom
}

function updateStateAndRender(prData) {
  // Filter out any key/value pairs with undefined values.
  var stateUpdates = _.omit(prData, _.isUndefined)
  _.extend(state, stateUpdates)
  render()
}

chrome.extension.sendMessage({}, function(response) {

  var readyStateCheckInterval = setInterval(function() {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);

      var prStatusPromise = $.get(BASE_URL + '/pulls/' + getPrId())
      var wrapperPromise = getTemplate('wrapper')

      wrapperPromise.done(function(template) {
        if (!$('.qai-wrapper').length) {
          $('.branch-action-body').append(template())
        }
      })

      $.when(prStatusPromise, wrapperPromise).done(function(prStatus, _) {
        updateStateAndRender(prStatus[0].data)
        maybeRequestFailedLog()
      })

      socket.on('picasso/pull/' + getPrId(), function(message) {
        var parsedMessage = JSON.parse(message)
        if (parsedMessage.deployInstanceLog || parsedMessage.serviceInstanceLog) {
          appendLogUpdate(parsedMessage)
        } else {
          console.log('ps:', message)
          updateStateAndRender(parsedMessage)
        }
      })

      console.log('ps: listening on channel "picasso/pull/' + getPrId() + '"');
  	}
	}, 10);
});
