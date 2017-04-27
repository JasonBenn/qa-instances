chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
  	if (document.readyState === "complete") {
  		clearInterval(readyStateCheckInterval);

      var badge = chrome.runtime.getURL('src/templates/badge.html')

      // var prStatusPromise = $.get('https://qa-instance-coordinator.minervaproject.com/pulls')
      // prStatusPromise.done(function(data) { 
      var prs = [2290, 2206, 2187]
      prs.forEach(function(prId) {
        getTemplate("badge").done(function(template) {
          var html = template({
            url: BASE_URL + "/app/login"
          })
          $('#issue_'+prId+' > .d-table').append(html)
        })
      })

  	}
	}, 10);
});
