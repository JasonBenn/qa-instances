chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		clearInterval(readyStateCheckInterval);

		console.log("This is the list of Minerva PRs!");

    var badge = chrome.runtime.getURL('src/templates/badge.html')
    $.get(badge).done(function(template) {
      console.log('waiting on arrive');
      // $(document).arrive("#issue_1834", {onceOnly: true, existing: true}, function() {
        console.log('arrived');
        console.log($('#issue_1834'));
        $('#issue_1834 > .d-table').append(template)
      // });
    })



    // $.get('qa-instance-coordinator.minervaproject.com/pulls').done(function() {
    //   $('.pull-requests').forEach(function() {
    //     // check if a pull matches, if so, insert a badge.
    //   })
    // })

	}
	}, 10);
});

// TEST: that this works when going backwards through pages