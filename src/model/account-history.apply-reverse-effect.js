"use strict"
/**
 * AccountHistory.applyReverseEffect
 * */
const { dispatch } = require("@kisbox/helpers")

/* Library */

function applyReverseEffect (account, record) {
  dispatch(applyReverseEffect, record.type, applicator => {
    applicator(account, record)
  })
}

applyReverseEffect.trustline_created = function (account, record) {
  const asset = assetId(record.asset_code, record.asset_issuer)
  delete account.balances[asset]
}

applyReverseEffect.trustline_removed = function (account, record) {
  const asset = assetId(record.asset_code, record.asset_issuer)
  account.balances[asset] = 0
}

applyReverseEffect.account_credited = function (account, record) {
  const asset = assetId(record.asset_code, record.asset_issuer)
  account.balances[asset] -= Number(record.amount)
}

applyReverseEffect.account_debited = function (account, record) {
  const asset = assetId(record.asset_code, record.asset_issuer)
  account.balances[asset] += Number(record.amount)
}

applyReverseEffect.trade = function (account, record) {
  const bought = assetId(record.bought_asset_code, record.bought_asset_issuer)
  const sold = assetId(record.sold_asset_code, record.sold_asset_issuer)
  account.balances[bought] -= Number(record.bought_amount)
  account.balances[sold] += Number(record.sold_amount)
}

applyReverseEffect.account_created = function (account) {
  delete account.balances.native
}

applyReverseEffect.account_removed = function (account) {
  account.balances.native = 0
}

/* Helpers */

function assetId (code, issuer) {
  return issuer ? `${code}:${issuer}` : "native"
}

/* Export */
module.exports = applyReverseEffect
