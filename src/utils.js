function monkeyPatchWebsocketClient(socket) {
  // Emits every received message to "*" channel, enabling clients to listen for all messages.
  var onevent = socket.onevent
  socket.onevent = function(packet) {
      var args = packet.data || []
      onevent.call(this, packet)  // original call
      packet.data = ["*"].concat(args)
      onevent.call(this, packet)
  }
}

function getUrlOfBottomOfPrPage(prId) {
  return "/minervaproject/picasso/pull/" + prId + "#partial-new-comment-form-actions"
}

function getTemplate(template) {
  var promise = $.Deferred()
  var badge = chrome.runtime.getURL('src/templates/' + template + '.html')
  $.get(badge).done(function(template) {
    promise.resolve(_.template(template))
  })
  return promise
}

function ajaxGet(url, options) {
  return $.ajax(_.extend({
    url: url,
    contentType: "application/json",
  }, options))
}

function ajaxDelete(url, options) {
  return $.ajax(_.extend({
    url: url,
    type: "DELETE",
    dataType: "json",
    contentType: "application/json"
  }))
}

function ajaxPost(url, data, options) {
  return $.ajax(_.extend({
    url: url,
    data: JSON.stringify(data),
    type: "POST",
    dataType: "json",
    contentType: "application/json"
  }))
}

function noOp() {}

var States = {
  Offline: "offline",
  Starting: "starting",
  Online: "online",
  Stopping: "stopping",
  Error: "error"
}

var Copy = {
  db: {
    offline: "Database deleted",
    starting: "Creating database",
    online: "Database created",
    stopping: "Deleting database",
    error: "Database error"
  },
  instance: {
    offline: "Instance deleted",
    starting: "Creating instance",
    online: "Instance created",
    stopping: "Deleting instance",
    error: "Instance creation/deletion error"
  },
  startInstance: {
    offline: "Instance offline",
    starting: "Starting instance",
    online: "Instance online",
    stopping: "Stopping instance",
    error: "Start/stop instance error"
  },
  route53: {
    offline: "Route53 record offline",
    starting: "Creating Route53 record",
    online: "Route53 record created",
    stopping: "Deleting Route53 record",
    error: "Route53 error"
  },
  deployInstance: {
    offline: "Deploy recipe not started",
    starting: "Deploying instance",
    online: "Deploy succeeded",
    error: "Deploy error"
  },
  serviceInstance: {
    offline: "Sanitize, migrate, service: waiting on DB & deploy steps",
    starting: "Sanitizing DB, migrating, running services",
    online: "Service recipes succeeded",
    error: "Sanitize, migration, and/or servicing error"
  }
}

var Helpers = {
  stateToColor: function(state) {
    return {
      "offline": "gray",
      "starting": "yellow",
      "online": "green",
      "stopping": "yellow",
      "error": "red"
    }[state] || "gray"
  },

  getCopy: function(uiType, state, progressUpdate, errorMessage) {
    var baseCopy = Copy[uiType][state || "offline"]

    if ((state === States.Starting && progressUpdate) || (state === States.Stopping && progressUpdate)) {
      return baseCopy + ": " + progressUpdate
    } else if (state === States.Error && errorMessage) {
      return baseCopy + ": " + errorMessage
    } else {
      return baseCopy
    }
  }
}
