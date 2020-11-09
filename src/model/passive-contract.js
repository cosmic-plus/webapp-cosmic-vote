"use strict"
/**
 * DMail with:
 * - object === "Contract (cosmic.vote)"
 * - destinations === either
 * - content === JSON params
 */
const { Keypair } = require("@cosmic-plus/base/es5/stellar-sdk")
const OcMessage = require("./oc-message")

/* Definition */
class PassiveContract extends OcMessage {
  static fromTxParams (txParams) {
    const contract = super.fromTxParams(txParams)
    contract.params = JSON.parse(contract.content)
    contract.type = contract.object.substr(1)

    const stateOp = txParams.operations.find(
      (op) => op.type === "createAccount"
    )
    if (stateOp) contract.state = stateOp.destination

    return contract
  }

  constructor (params) {
    super(params)
    this.$import(params, ["state", "params", "type", "network"])
  }

  toTxParams () {
    const txParams = super.toTxParams()

    if (this.state) {
      txParams.addOperation("createAccount", {
        destination: this.state,
        startingBalance: 1
      })
    }

    return txParams
  }
}

/* Computations */
const proto = PassiveContract.prototype

proto.$define("content", ["params"], function () {
  if (this.params.title === "") delete this.params.title
  return JSON.stringify(this.params)
})

proto.$define("object", ["type"], function () {
  return `~${this.type}`
})

/* Utilities */

PassiveContract.makeState = function () {
  const keypair = Keypair.random()
  const pubkey = keypair.publicKey()
  return pubkey
}

/* Export */
module.exports = PassiveContract
