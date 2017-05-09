var LOCAL = false

var BASE_URL = "https://qa-instance-coordinator" + (LOCAL ? "-local" : "") + ".minervaproject.com"

var States = {
  OFFLINE: "offline",
  STARTING: "starting",
  ONLINE: "online",
  STOPPING: "stopping",
  ERROR: "error"
}