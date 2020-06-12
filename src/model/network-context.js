"use strict"
/**
 * NetworkContext
 * */
const StellarSdk = require("@cosmic-plus/base/es5/stellar-sdk")

const { LiveObject } = require("@kisbox/model")

const CrudArray = require("../lib/crud-array")

/* Definiton */

class NetworkContext extends LiveObject {
  static normalize (network) {
    if (typeof network === "string") {
      return NetworkContext.list.get(network)
    } else if (!network) {
      return NetworkContext.list.get("public")
    } else {
      return network
    }
  }

  constructor (params) {
    super()
    this.$import(params, ["id", "passphrase", "horizon"])
  }
}

/* Computations */
const proto = NetworkContext.prototype

proto.$on("horizon", function () {
  if (this.horizon && this.horizon.substr(0, 4) !== "http") {
    this.horizon = `https://${this.horizon}`
  }
})

proto.$define("server", ["horizon"], function () {
  return new StellarSdk.Server(this.horizon)
})

/* Data */
NetworkContext.list = new CrudArray(NetworkContext)

NetworkContext.list.put({
  id: "public",
  passphrase: "Public Global Stellar Network ; September 2015",
  horizon: "https://horizon.stellar.org"
})
NetworkContext.list.put({
  id: "test",
  passphrase: "Test SDF Network ; September 2015",
  horizon: "https://horizon-testnet.stellar.org"
})

/* Export */
module.exports = NetworkContext
