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
  serviceInstanceError: "",

  deployInstanceLog: [],
  serviceInstanceLog: []
}

var state = _.clone(initialUIState)
var socket = io.connect(BASE_URL);

function getPrId() {
  const numericSegment = /\/(\d+)(\/?|$)(#.*)?/
  const match = numericSegment.exec(location.href)
  if (match) return match[1]
}

function getPrName() {
  return $('.commit-ref').eq(1).attr('title').split(':').slice(1).join(':')
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

function scrollLogContainers() {
  $('.qai-drawer').each(function(i, drawer) { drawer.scrollTop += 10000 })
}

function updateStateAndRender(prData) {
  var logTypes = ["deployInstanceLog", "serviceInstanceLog"]
  logTypes.forEach(function(logType) {
    if (prData && prData[logType]) {
      state[logType] = state[logType].concat(prData[logType].split("\n"))
    }
  })

  var stateUpdates = _.omit(_.omit(prData, _.isUndefined), logTypes); // Filter out any key/value pairs with undefined values.
  _.extend(state, stateUpdates)
  render()
  scrollLogContainers()
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
      })

      socket.on('picasso/pull/' + getPrId(), function(message) {
        var parsedMessage = JSON.parse(message)
        updateStateAndRender(parsedMessage)
      })

  	}
	}, 10);
});
