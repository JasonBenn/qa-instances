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