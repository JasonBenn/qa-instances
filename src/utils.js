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

  stateToText: function(state, messagePrefix, progressUpdate, errorMessage) {
    if (state === States.Online) {
      return messagePrefix + "online"
    } else if (state === States.Starting) {
      return messagePrefix + (progressUpdate || "starting...")
    } else if (state === States.Offline || !state) {
      return messagePrefix + "offline"
    } else if (state === States.Stopping) {
      return messagePrefix + (progressUpdate || "stopping...")
    } else if (state === States.Error) {
      return messagePrefix + errorMessage
    }
  }
}
