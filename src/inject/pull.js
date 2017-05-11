var initialUIState = {
  // state part 1: UI-only state
  loading: false,

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
  return /\/(\d+)$/.exec(location.href)[1]
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

function render() {
  var templatePromise
  var callback = noOp

  var overallState = state.overallState

  if (state.loading) {
    templatePromise = getTemplate("loading")

  } else if (overallState === States.Offline || !overallState) {
    templatePromise = getTemplate("offline")
    callback = listenForClickCreate

  } else if ([States.Starting, States.Stopping, States.Error].includes(overallState)) {
    templatePromise = getTemplate("starting-stopping")
    callback = listenForClickDestroy

  } else if (overallState === States.Online) {
    templatePromise = getTemplate("online")
    callback = listenForClickDestroy
  }

  templatePromise.done(function(template) {
    // Mix in valid states from config.js.
    $('.qai-wrapper').html(template(_.extend({}, States, Helpers, state)))
    callback()
  })
}

function updateStateAndRender(prData) {
  // Filter out any key/value pairs with undefined values.
  var stateUpdates = _.omit(_.omit(prData, _.isUndefined), _.isNull)
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
        $('.mergeability-details .branch-action-item').last().after(template())
      })

      $.when(prStatusPromise, wrapperPromise).done(function(prStatus, _) {
        updateStateAndRender(prStatus[0].data)
      })

      socket.on('picasso/pull/' + getPrId(), function(message) {
        console.log('ps:', message);
        updateStateAndRender(JSON.parse(message))
      })

      console.log('ps: listening on channel "picasso/pull/' + getPrId() + '"');
  	}
	}, 10);
});
