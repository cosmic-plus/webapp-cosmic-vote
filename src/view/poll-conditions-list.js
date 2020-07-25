"use strict"
/**
 * PollConditionsList
 * */
const prettyMs = require("pretty-ms")

const { View, html } = require("@kisbox/browser")

const { shorter } = require("@cosmic-plus/helpers")
const { aliases } = require("@cosmic-plus/base")

/* Definition */

class PollConditionsList extends View {
  constructor (poll) {
    super(`
<ul class="PollConditionsList">
  %toLine:...conditions
</li>
    `)

    this.$import(poll, [
      "network",
      "maxTime",
      "isClosed",
      "noEdit",
      "voterHodl",
      "record"
    ])
  }
}

/* Computations */
const proto = PollConditionsList.prototype

proto.$define(
  "conditions",
  ["network", "maxTime", "isClosed", "noEdit", "voterHodl", "record"],
  function () {
    const conditions = []
    if (this.network) {
      conditions.push(`Network: Stellar ${this.network.id}`)
    }
    if (this.maxTime) {
      const date = new Date(this.maxTime)
      const dateString = date.toLocaleString()
      if (this.isClosed) {
        conditions.push(`Closed the ${dateString}`)
      } else {
        conditions.push(`Closes the ${dateString}`)
      }
    }
    if (this.noEdit) {
      conditions.push(`No vote editing`)
    }
    if (this.voterHodl) {
      const { assetId, amount, since } = this.voterHodl
      const asset = prettyAsset(assetId)

      let message = `Requirement: `
      if (amount) {
        message += `Voter hold ${amount} ${asset}`
      } else {
        message += `Voter has a trustline for ${asset}`
      }

      if (since) {
        const pollOpening = new Date(this.record.created_at)
        const hodlInterval = prettyInterval(pollOpening - new Date(since))
        message += ` since ${hodlInterval}`
      }

      conditions.push(message)
    }
    return conditions
  }
)

/* Helpers */
const helpers = PollConditionsList.helpers

helpers.toLine = function (condition) {
  return html("li", { textContent: condition })
}

/* Helpers */

function prettyAsset (assetId) {
  const [code, issuer] = assetId.split(":")
  if (!issuer && code === "native") {
    return "XLM"
  } else {
    const prettyIssuer = aliases.all[issuer] || shorter(issuer)
    const prettyAsset = `${code} (${prettyIssuer})`
    return prettyAsset
  }
}

function prettyInterval (ms) {
  const prettyFull = prettyMs(ms, { verbose: true })
  const prettyShort = prettyFull
    .split(" ")
    .slice(0, 2)
    .join(" ")
  return prettyShort
}

/* Export */
module.exports = PollConditionsList
