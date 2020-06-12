/* eslint-env jasmine */
"use strict"

const { StellarSdk } = require("@cosmic-plus/base")
const NetworkContext = require("../../src/model/network-context")

/* Specifications */

describe("NetworkContext", () => {

  describe(".list.get()", () => {
    it("returns a network by id", () => {
      const network = NetworkContext.list.get("public")
      expect(network.id).toBe("public")
      expect(network.horizon).toBe("https://horizon.stellar.org")
      expect(network.passphrase).toBe(StellarSdk.Networks.PUBLIC)
      expect(network.server).not.toBe(undefined)
    })
  })
})
