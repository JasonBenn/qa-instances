![image](https://cloud.githubusercontent.com/assets/2539761/25288498/197cfc4e-269c-11e7-923f-7e83fcd595ac.png)

# QA Instances

This project was inspired by Heroku's [Review Apps](https://devcenter.heroku.com/articles/github-integration-review-apps) project:

> Review apps run the code in any GitHub pull request in a complete, disposable app on Heroku. Each review app has a unique URL you can share.
>
> Review apps are a great way to propose, discuss and merge changes to your code base. Because pull request branches are deployed to new [instances] on Heroku, it’s very simple for you and your collaborators to test and debug code branches.

QA Instances (QAI) works the same way, but for codebases hosted and deployed via Amazon Web Services - specifically, OpsWorks, Route53, and RDS.

One difference between the two projects is that QAI will additionally copy and sanitize production data for each new instance. This way, users are able to log in with their actual credentials and experiment freely with the instance, as if they were logged in to the real app.

We use this tool at the [Minerva Project](https://www.minerva.kgi.edu/) to:
- 🍀 catch defects before they're pushed to production,
- ✨ keep PMs abreast of progress on feature development,
- 💪 regularly exercise the deployment pipeline,
- 🙌 allow designers to deploy their changes without engineering assistance,
- 🚀 and reduce the time between iterations on new features.

## A tour of features

After installing the extension, creating a QA Instance is as simple as clicking a button:

<img width="800" alt="create button small" src="https://user-images.githubusercontent.com/2539761/27764065-baf3c536-5e90-11e7-9aa0-34baf0fe34dc.png">

--- 

The extension will push updates on the deployment process to your browser:

<img width="800" alt="starting small" src="https://user-images.githubusercontent.com/2539761/27764067-bd19344a-5e90-11e7-83e9-aef678d484cb.png">

--- 

Once complete, you'll have the option to visit the instance's URL, re-clone production data, redeploy the instance, or destroy the instance (they're automatically destroyed once the PR is closed):

<img width="800" alt="success small" src="https://user-images.githubusercontent.com/2539761/27764068-c04bceac-5e90-11e7-9a20-5ec0293c165c.png">

---

If there was an error during one of the steps, a tail of the relevant log will be fetched from the instance and displayed inline:

<img width="800" alt="error state small" src="https://user-images.githubusercontent.com/2539761/27764069-c2079abe-5e90-11e7-8174-42c44d88e480.png">

---

Finally, running instances are displayed on the PRs page, so that you can see them all at a glance:

<img width="700" alt="prs small" src="https://user-images.githubusercontent.com/2539761/27764072-c3f544b6-5e90-11e7-8569-e1829d14b66a.png">

## This is the Chrome Extension half

This extension injects assets and HTML into Github PR pages.
The API and websocket servers are [here](https://github.com/jasonbenn/qa-instances-api).

## Installation

This project has currently only ever been configured for Minerva Project codebases, but most (all?) of the things that are unique to Minerva should have been captured in a single configuration JSON file. I'd love to spread this project - please [contact me](mailto:jasoncbenn@gmail.com) for help getting set up!

## Updating the extension

You'll need to a) pull the latest updates and b) reload extensions (I recommend [Extensions Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/fimgfedafeadlieiabdeeaodndnlbhid/related), but you can also just browse to chrome://extensions and click "Reload Extension").

## Local development

- Clone this project
- Use `config.js` to configure the project, including setting the `LOCAL` boolean to `true`. This will stub API calls to AWS APIs, and send requests to a [local API server](https://github.com/jasonbenn/qa-instances-api).
- Go to `chrome://extensions`, check "Developer mode", click "Load unpacked extension..." and choose this repo. You should now see QAI content loading on your project's pull requests.
- Reload `chrome://extensions` to load updates into your browser.

*Gotcha*: if you want to add a new asset to the chain of dependencies that are loaded on a Github page, you'll need to update the appropriate `content_scripts` entry in `manifest.json` _and_ you'll need to add the asset to `background.js`. 
_`content_scripts` are loaded when a page matching the glob is loaded, but won't load those assets on URL state changes that aren't also full page loads (as are common in single page apps), so transitions from /pulls to /pull/:prId and back would would be missed. `background.js` listens for these URL state changes and injects those same assets manually, so it also needs to know about your dependencies._
