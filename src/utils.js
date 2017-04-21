function getTemplate(template) {
  var promise = $.Deferred()
  var badge = chrome.runtime.getURL('src/templates/' + template + '.html')
  $.get(badge).done(function(template) {
    promise.resolve(_.template(template))
  })
  return promise
}
