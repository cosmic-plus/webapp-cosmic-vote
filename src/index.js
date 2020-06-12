"use strict"
/**
 * Webapp Entry Point
 */

/* Extends helpers */
const helpers = require("@cosmic-plus/helpers")
Object.assign(helpers, require("./helpers"))

/* Extends TxParams */
const TxParams = require("@cosmic-plus/tx-params")
TxParams.setFormat("txHash", require("./lib/tx-params.tx-hash"))
TxParams.setFormat("txRecord", require("./lib/tx-params.tx-record"))

/* Depends */
const CosmicVote = require("./app")

/* Initialization */

// Loading message.
const loadingDiv = document.querySelector(".Loading")
loadingDiv.hidden = false

// Service worker.
const worker = navigator.serviceWorker
if (worker) {
  worker.register("worker.js")
  worker.addEventListener("controllerchange", () => location.reload())
}

// App Loading.
const app = CosmicVote.forLocation(location)
app.$mount()

// eslint-disable-next-line no-console
console.log("Application:", app)

// Address syncing
app.$on("route", () => history.replaceState(null, null, app.route))
app.$trigger("route")
