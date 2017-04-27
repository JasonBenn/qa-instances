var initialState = {
  instanceState: "offline"
}

var state = {
  loading: false,
  instanceState: "offline", // offline, starting, online, stopping

  newerShaAvailable: true, // getLatestSha() !== data.sha,
  url: "https://qa-features-lo-detail-page.minervaproject.com",
  oldCommitSha: "c4c82e1",
  oldCommitUrl: "https://github.com/minervaproject/picasso/pull/2187/commits/c4c82e13295f3e73d77c6a7659598f3dbf4b9487",
  newCommitSha: "6085a62",
  newCommitUrl: "https://github.com/minervaproject/picasso/pull/2283/commits/6085a62e8f9ae0a365f4b16bac89a6e223ccea02"
}

var socket = io.connect('https://qa-instance-coordinator.minervaproject.com/');

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
    state.instanceState = "stopping"
    render()
    ajaxDelete(BASE_URL + "/pulls/" + getPrId()).done(function() {
      state = _.clone(initialState)
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
      state = _.extend(state, response.data, { loading: false })
      render()
    })
  })
}

function render() {
  var templatePromise
  var callback = noOp

  if (state.loading) {
    templatePromise = getTemplate("loading")

  } else {

    if (state.instanceState === "offline") {
      templatePromise = getTemplate("create")
      callback = listenForClickCreate

    } else if (state.instanceState === "starting") {
      templatePromise = getTemplate("starting")
      callback = listenForClickDestroy

    } else if (state.instanceState === "online") {
      templatePromise = getTemplate("online")
      callback = listenForClickDestroy

    } else if (state.instanceState === "stopping") {
      templatePromise = getTemplate("stopping")
    }
  }

  templatePromise.done(function(template) {
    $('.pulls-wrapper').html(template(state))
    callback()
  })
}

function updateStateAndRender(prData) {
  // Filter out any key/value pairs with undefined values.
  var stateUpdates = _.pick(prData, _.identity)
  state = _.extend(state, stateUpdates)
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

      $.when(prStatusPromise, wrapperPromise).done(function(prStatus, wrapper) {
        updateStateAndRender(prStatus[0].data)
      })

      socket.on('picasso/pull/' + getPrId(), function(message) {
        updateStateAndRender(JSON.parse(message))
      })

  	}
	}, 10);
});