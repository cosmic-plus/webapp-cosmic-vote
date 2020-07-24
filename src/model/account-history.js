"use strict"
/**
 * AccountHistory
 * */
const { LiveObject } = require("@kisbox/model")
const { xeach } = require("@kisbox/helpers")

const loopcall = require("@cosmic-plus/loopcall")

const NetworkContext = require("./network-context")

/* Definition */

class AccountHistory extends LiveObject {
  constructor (params) {
    super()

    /* Defaults */
    this.records = []

    /* Imports */
    this.$import(params, ["address", "network"])
  }

  async hasHodled ({
    assetId = "native",
    amount = 0,
    to = new Date(),
    since = to
  }) {
    let returned = true
    await this.getPastState(since, pastState => {
      if (pastState.date > to) return
      const hodled = pastState.balances[assetId]
      if (!hodled || hodled < amount) {
        returned = false
        // Break
        return true
      }
    })
    return returned
  }

  async getPastState (dateString, parentBreaker) {
    const pubkey = await this.pubkey
    const account = await this.network.server.loadAccount(pubkey)

    const pastState = { id: account.id, balances: {} }
    account.balances.forEach(balance => {
      const asset =
        balance.asset_type === "native"
          ? "native"
          : `${balance.asset_code}:${balance.asset_issuer}`
      pastState.balances[asset] = Number(balance.balance)
    })

    const targetDate = new Date(dateString)
    const callBuilder = this.network.server
      .effects()
      .forAccount(pubkey)
      .order("desc")
    await loopcall(callBuilder, {
      breaker (record) {
        const recordDate = new Date(record.created_at)
        return (
          targetDate > recordDate || parentBreaker && parentBreaker(pastState)
        )
      },
      iterate (record) {
        AccountHistory.applyReverseEffect(pastState, record)
        pastState.date = record.created_at
      }
    })

    if (parentBreaker) parentBreaker(pastState)
    AccountHistory.normalizePastState(pastState)
    return pastState
  }

  async getAccount () {
    const pubkey = await this.pubkey
    const account = await this.network.server.loadAccount(pubkey)
    return account
  }
}

/* Utilities */
AccountHistory.normalizePastState = function (pastState) {
  xeach(pastState.balances, (value, asset) => {
    pastState.balances[asset] = value.toFixed(7)
  })
}

/* Computations */
const proto = AccountHistory.prototype

proto.$define("pubkey", ["address"], async function () {
  const federated = await NetworkContext.resolveAddress(this.address)
  return federated.account_id
})

/* Export */
AccountHistory.applyReverseEffect = require("./account-history.apply-reverse-effect")
module.exports = AccountHistory
