var initialUIState = {
  // state part 1: UI-only state
  loading: false,

  // state part 2: progress outputs from long-running API functions
  // keys here, by convention, are equal to names of functions emitting status updates
  createDB: "",

  // state part 3: all key-value pairs from relevant DB record
  dbState: ""
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
      state = _.clone(initialUIState)
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

  var instanceState = state.instanceState

  if (state.loading) {
    templatePromise = getTemplate("loading")

  } else if (instanceState === States.Instance.OFFLINE || !instanceState) {
    templatePromise = getTemplate("create")
    callback = listenForClickCreate

  } else if (instanceState === States.Instance.STARTING || instanceState === States.Instance.STOPPING) {
    templatePromise = getTemplate("changing")
    callback = listenForClickDestroy

  } else if (instanceState === States.Instance.ONLINE) {
    templatePromise = getTemplate("online")
    callback = listenForClickDestroy
  }

  templatePromise.done(function(template) {
    // Mix in valid states from config.js.
    $('.pulls-wrapper').html(template(_.extend({}, States, state)))
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
      var wrapperPromise = getTemplate('pull-wrapper')

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