"use strict"
/**
 * OcMessage
 */
const TxParams = require("@cosmic-plus/tx-params")

const { LiveObject } = require("@kisbox/model")
const { xeach } = require("@kisbox/helpers")

const NetworkContext = require("./network-context")

/* Definition */
class OcMessage extends LiveObject {
  static async fromTxHash (txHash, network) {
    const txParams = await TxParams.from("txHash", txHash, network)
    return this.fromTxParams(txParams)
  }

  static fromTxParams (txParams) {
    const message = new this()
    message.network = txParams.network
    message.object = txParams.memo && txParams.memo.value
    message.destination = operationsToDestination(txParams.operations)
    message.content = operationsToContent(txParams.operations)
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

  toCosmicLink (handler = "https://cosmic.link") {
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
