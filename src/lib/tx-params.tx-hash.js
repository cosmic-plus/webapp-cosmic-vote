"use strict"
/**
 * TxParams.Format: TxHash
 * */
const NetworkContext = require("../model/network-context")

/* Definition */
const decode = {}

decode.transaction = async function (tx, txHash, options = {}) {
  const network = NetworkContext.normalize(options.network)
  const callBuilder = network.server.transactions().transaction(txHash)
  const record = await callBuilder.call()
  return tx.constructor.from("txRecord", record, options)
}

/* Export */
module.exports = { decode }
