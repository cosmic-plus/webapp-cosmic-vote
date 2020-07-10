"use strict"
/**
 * PollContract
 * */
const loopcall = require("@cosmic-plus/loopcall")
const TxParams = require("@cosmic-plus/tx-params")
const SideFrame = require("cosmic-lib/es5/helpers/side-frame")
const { hide, timeout } = require("@kisbox/helpers")

const Poll = require("./poll")
const PassiveContract = require("./passive-contract")
const NetworkContext = require("./network-context")
const OcMessage = require("./oc-message")

/* Data */
const name = "majority-judgment"
const version = "1.0"

/* Definition */

class PollContract extends Poll {
  static async fromTxHash (hash, network) {
    const contract = await PassiveContract.fromTxHash(hash, network)
    const poll = PollContract.fromPassiveContract(contract)
    return poll
  }

  static fromTxParams (txParams) {
    const contract = PassiveContract.fromTxParams(txParams)
    const poll = this.fromPassiveContract(contract)
    return poll
  }

  static fromPassiveContract (contract) {
    const poll = new PollContract(contract.params)
    poll.$pick(contract, [
      "type",
      "state",
      "destination",
      "record",
      "network",
      "txHash"
    ])
    return poll
  }

  constructor (params) {
    super(params)

    /* Defaults */
    this.type = `${name}@${version}`
    this.state = PassiveContract.makeState()
    this.destination = null
    this.network = "test"
    this.record = {}
    this.syncing = null

    /* Imports */
    this.$import(params, ["network", "type", "state", "destination"])
  }

  toPassiveContract () {
    const contract = new PassiveContract({
      type: this.type,
      network: this.network,
      state: this.state,
      destination: this.destination,
      params: {
        title: this.title,
        members: this.members
      }
    })

    this.type = contract.type
    this.state = contract.state
    return contract
  }

  toTxParams () {
    const contract = this.toPassiveContract()
    return contract.toTxParams()
  }

  async waitValidation (maxTime = 30) {
    const network = NetworkContext.normalize(this.network)

    this.syncing = true
    let attempts = Math.floor(maxTime / 2)
    while (!this.txHash) {
      this.txHash = await maybeFindContract(this.state, network)
      if (!this.syncing || attempts === 0) {
        this.syncing = false
        throw new Error("The poll contract haven't been validated")
      }
      attempts--
      await timeout(2000)
    }

    this.syncing = false
    this.streamVotes()
    return this.txHash
  }

  postVote (vote) {
    const network = NetworkContext.normalize(this.network)

    const message = new OcMessage({
      network: network.id,
      object: "Vote",
      destination: this.state,
      content: JSON.stringify(vote)
    })

    const txRequest = message.toCosmicLink()
    const frame = new SideFrame(txRequest)
    return frame
  }

  async getVotes (cursor) {
    const callBuilder = this.makeMessageCallBuilder(cursor)
    this.syncing = true

    await loopcall(callBuilder, {
      filter: paymentRecord => this.ingestPaymentRecord(paymentRecord)
    })

    this.computeResults()
    this.syncing = false
    return
  }

  async streamVotes (cursor) {
    const callBuilder = this.makeMessageCallBuilder(cursor)
    this.voteStream = callBuilder.stream({
      onmessage: this.ingestPaymentRecord.bind(this),
      onerror: console.error
    })
  }

  stopVoteStream () {
    if (this.voteStream) {
      const stopStream = this.voteStream
      this.voteStream = null
      return stopStream()
    }
  }

  async waitForVote (choice, maxTime = 30) {
    const expected = JSON.stringify(choice)

    const promise = new Promise((resolve, reject) => {
      timeout(maxTime * 1000).then(() => {
        cleanup()
        reject(new Error("The vote haven't been validated"))
      })

      const callback = ([vote]) => {
        const returned = JSON.stringify(vote.choice)
        if (returned !== expected) return
        cleanup()
        resolve()
      }

      const cleanup = () => this.votes.$off("$add", callback)
      this.votes.$on("$add", callback)
    })

    return promise
  }

  /* Low Level */

  makeMessageCallBuilder (cursor = this.cursor) {
    const server = NetworkContext.normalize(this.network).server
    const callBuilder = server.payments().forAccount(this.state)
    if (cursor) callBuilder.cursor(cursor)

    callBuilder.join("transactions")
    return callBuilder
  }

  async ingestPaymentRecord (paymentRecord) {
    this.cursor = paymentRecord.id
    if (paymentRecord.to !== this.state) return

    const txRecord = paymentRecord.transaction_attr
    if (txRecord.memo !== "Vote") return

    const txParams = TxParams.from("txRecord", txRecord)
    const input = PassiveContract.fromTxParams(txParams)

    // Carefully ignore wrong inputs.
    const choice = input.params
    if (choice.length !== this.members.length) return
    if (choice.some(x => x < 0 || x > 5 || !isInteger(x))) return

    const id = txRecord.source_account
    this.pushVote({ id, choice })
  }
}

/* Conposition */
hide(PollContract.prototype, "toCosmicLink", OcMessage.prototype.toCosmicLink)

/* Helpers */

function isInteger (value) {
  return String(Math.trunc(value)) === String(value)
}

function maybeFindContract (pubkey, network) {
  return fundingTransaction(pubkey, network).catch(() => null)
}

async function fundingTransaction (pubkey, network) {
  const payments = network.server.payments()
  const callBuilder = payments.forAccount(pubkey).limit(1)
  const response = await callBuilder.join("transactions").call()
  return response.records[0].transaction_hash
}

/* Export */
module.exports = PollContract
