"use strict"
/**
 * TxParams.Format: TxRecord
 * */
const { Transaction } = require("@cosmic-plus/base/es5/stellar-sdk")
const NetworkContext = require("../model/network-context")

/* Definition */
const decode = {}

decode.transaction = function (tx, record, options = {}) {
  const network = NetworkContext.normalize(options.network)
  const transaction = new Transaction(record.envelope_xdr, network.passphrase)
  const txParams = tx.constructor.from("transaction", transaction)
  txParams.network = network.id
  txParams.record = record
  return txParams
}

/* Export */
module.exports = { decode }
