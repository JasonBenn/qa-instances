var LOCAL = true
var BASE_URL = "https://qa-instance-coordinator" + (LOCAL ? "-local" : "") + ".minervaproject.com"

var DB_STATES = {

}

var States = {
  Instance: {
    OFFLINE: "offline",
    STARTING: "starting",
    ONLINE: "online",
    STOPPING: "stopping"
  },
  DB: {
    OFFLINE: "offline",
    STARTING: "starting",
    ONLINE: "online",
    ERROR: "error"
  }
}
