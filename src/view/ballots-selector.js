"use strict"
/**
 * BallotSelector
 * */
const { View, html } = require("@kisbox/browser")
const { shorter } = require("@cosmic-plus/helpers")

/* Definition */

class BallotSelector extends View {
  constructor (params) {
    super(`
<label class="BallotSelector" hidden=%not:hasUserBallots>
  <span>Ballot:</span>
  <select value=%ballotId>
    %toBallotOption:...userBallots
    <option value="new">New</option>
  </select>
</label>
    `)

    /* Defaults */
    this.userBallots = []
    this.ballotId = ""
    this.ballot = null
    this.hasUserBallots = null

    /* Imports */
    this.$import(params, ["userBallots", "ballot"])
  }
}

/* Computations */
const proto = BallotSelector.prototype

proto.$define("ballotId", ["ballot", "userBallots"], function () {
  if (!this.userBallots || !this.userBallots.length) return "hide"
  if (!this.ballot) return "new"
  return this.ballot.id
})

proto.$define("ballot", ["ballotId", "userBallots"], function () {
  if (!this.userBallots || !this.userBallots.get) return null
  if (this.ballotId === "new") return null
  return this.userBallots.get(this.ballotId) || null
})

proto.$define("hasUserBallots", ["ballot", "userBallots"], function () {
  return this.userBallots && this.userBallots.length > 0
})

/* Helpers */
const helpers = BallotSelector.helpers

helpers.toBallotOption = function (ballot) {
  const selected = ballot.id === this.ballotId
  return html("option", {
    value: ballot.id,
    textContent: shorter(ballot.id),
    selected
  })
}

/* Export */
module.exports = BallotSelector
