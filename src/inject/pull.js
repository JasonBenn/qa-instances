var initialUIState = {
  loading: false
}

var state = {
  // state part 1: UI-only state - mixed in from above object

  // state part 2: key-value pairs from the DB record corresponding to this PR
  // changes in the DB record are broadcast to this state atom via pubsub.

  // state part 3: progress outputs from long-running API functions
  // keys here must exactly correspond to API function names. Names recorded here for sanity.
  // createDB: ""

  // -- to delete --
  // instanceState: "offline", // offline, starting, online, stopping

  // url: "https://qa-features-lo-detail-page.minervaproject.com",
  // oldCommitSha: "c4c82e1",
  // oldCommitUrl: "https://github.com/minervaproject/picasso/pull/2187/commits/c4c82e13295f3e73d77c6a7659598f3dbf4b9487",
  // newCommitSha: "6085a62",
  // newCommitUrl: "https://github.com/minervaproject/picasso/pull/2283/commits/6085a62e8f9ae0a365f4b16bac89a6e223ccea02",
}

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
    state = { loading: true }
    render()
    ajaxDelete(BASE_URL + "/pulls/" + getPrId()).done(function() {
      state = { loading: false }
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

  if (state.loading) {
    templatePromise = getTemplate("loading")

  } else if (state.instanceState) {

    if (state.instanceState === "starting") {
      templatePromise = getTemplate("starting")
      callback = listenForClickDestroy

    } else if (state.instanceState === "online") {
      templatePromise = getTemplate("online")
      callback = listenForClickDestroy

    } else if (state.instanceState === "stopping") {
      templatePromise = getTemplate("stopping")
    }

  } else {
    templatePromise = getTemplate("create")
    callback = listenForClickCreate
  }

  templatePromise.done(function(template) {
    $('.pulls-wrapper').html(template(state))
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
        updateStateAndRender(JSON.parse(message))
      })

      console.log('ps: listening on channel "picasso/pull/' + getPrId() + '"');
  	}
	}, 10);
});