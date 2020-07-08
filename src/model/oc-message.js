"use strict"
/**
 * OcMessage
 */
const loopcall = require("@cosmic-plus/loopcall")
const TxParams = require("@cosmic-plus/tx-params")

const { LiveObject, LiveArray } = require("@kisbox/model")
const { xeach } = require("@kisbox/helpers")

const NetworkContext = require("./network-context")

/* Definition */
class OcMessage extends LiveObject {
  static async fromTxHash (txHash, network) {
    const txParams = await TxParams.from("txHash", txHash, { network })
    return this.fromTxParams(txParams)
  }

  static fromTxParams (txParams) {
    const message = new this()
    message.network = txParams.network
    message.object = txParams.memo && txParams.memo.value
    message.destination = operationsToDestination(txParams.operations)
    message.content = operationsToContent(txParams.operations)
    message.record = txParams.record
    clean(message)
    return message
  }

  constructor (params) {
    super()

    this.$import(params, ["object", "destination", "content", "network"])
  }

  toTxParams () {
    const txParams = new TxParams({
      network: this.network.id,
      memo: this.object
    })

    xeach(this.destination, address => {
      txParams.addOperation("payment", {
        amount: 0.0000001,
        destination: address
      })
    })

    const chunkOperations = contentToOperations(this.content)
    const chunksMax = 100 - txParams.operations.length
    if (chunkOperations.length > chunksMax) {
      throw new Error("DMail: content is too long")
    }

    chunkOperations.forEach(op => txParams.operations.push(op))
    txParams.parse()

    return txParams
  }

  toCosmicLink (handler = "https://test.cosmic.link") {
    const txParams = this.toTxParams()
    const query = txParams.to("query")
    const link = `${handler}/${query}`
    return link
  }
}

/* Computations */
const proto = OcMessage.prototype

// TODO: $guard
proto.$on("network", function (network) {
  if (typeof network === "string") {
    this.network = NetworkContext.list.get(network)
  }
})

/* Utilities */

OcMessage.listMessages = async function (pubkey, network) {
  const mailbox = {
    network,
    pubkey,
    inbox: new LiveArray(),
    outbox: new LiveArray(),
    cursor: null
  }

  const that = this
  const callBuilder = OcMessage.makeMessageCallBuilder(mailbox).order("desc")
  await loopcall(callBuilder, {
    filter (paymentRecord) {
      mailbox.cursor = paymentRecord.id
      that.addToMailbox(mailbox, paymentRecord)
    }
  })

  mailbox.stream = function () {
    const callBuilder = this.makeMessageCallBuilder(mailbox)
    this.stopStream = callBuilder.stream({
      onmessage: record => OcMessage.addToMailbox(mailbox, record),
      onerror: console.error
    })
  }

  return mailbox
}

OcMessage.addToMailbox = function (mailbox, paymentRecord) {
  const txRecord = paymentRecord.transaction_attr
  const txParams = TxParams.from("txRecord", txRecord)
  txParams.network = mailbox.network
  if (!this.isTxParamsValid(txParams)) return true

  const message = this.fromTxParams(txParams)
  if (paymentRecord.to === mailbox.pubkey) {
    mailbox.inbox.push(message)
  } else if (paymentRecord.from === mailbox.pubkey) {
    mailbox.outbox.push(message)
  }
}

OcMessage.isTxParamsValid = function (txParams) {
  return txParams.operations.some(operation => {
    return operation.type === "manageData" && operation.name === "POST"
  })
}

OcMessage.makeMessageCallBuilder = function (params = {}) {
  const { pubkey, network, cursor } = params
  const server = NetworkContext.normalize(network).server
  const callBuilder = server.payments().forAccount(pubkey)
  if (cursor) callBuilder.cursor(cursor)

  callBuilder.join("transactions")
  return callBuilder
}

function contentToOperations (content) {
  if (!(content instanceof Buffer)) {
    content = Buffer.from(content)
  }

  const chunks = splitBuffer(content)
  if (!chunks.length) return []

  chunks.push("")
  return chunks.map(chunk => {
    return {
      type: "manageData",
      name: "POST",
      value: chunk
    }
  })
}

function operationsToDestination (ops) {
  const result = []

  ops.forEach(op => {
    if (
      op.type === "payment"
      && op.amount === "0.0000001"
      && op.asset.code === "XLM"
      && !op.asset.issuer
    ) {
      result.push(op.destination)
    }
  })

  return result
}

function operationsToContent (ops) {
  const chunks = []

  ops.forEach(op => {
    if (op.type !== "manageData" || op.name !== "POST") return

    const data = op.value
    if (data.type === "base64") {
      const text = Buffer.from(data.value, "base64").toString()
      chunks.push(text)
    } else {
      chunks.push(data.value)
    }
  })

  return chunks.join("")
}

/* Helpers */

function splitBuffer (content, chunkSize = 64) {
  if (!(content instanceof Buffer)) {
    content = Buffer.from(content)
  }

  const chunksNum = Math.ceil(content.length / chunkSize)

  const chunks = []
  for (let i = 0; i < chunksNum; i++) {
    const index = i * chunkSize
    const chunk = content.slice(index, index + chunkSize)
    chunks.push(chunk)
  }

  return chunks
}

function clean (object) {
  for (let key in object) {
    if (object[key] === undefined) {
      delete object[key]
    }
  }
}

/* Export */
module.exports = OcMessage
