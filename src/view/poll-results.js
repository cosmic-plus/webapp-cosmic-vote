"use strict"
/**
 * Poll Results
 * */
const { View } = require("@kisbox/browser")

const prettyMs = require("pretty-ms")

/* Definition */

class PollResults extends View {
  constructor (poll) {
    super(`
<div class="PollResults">

  <ol>
    %{toResultsMember:...results}
  </ol>

  <footer hidden=%has:syncing>
    <span>%timeSinceOpen</span>
    <span>Never expire</span>
    <span>Number of votes: %{length}</span>
  </footer>
</div>
    `)

    this.$import(poll, ["results", "votes", "record", "syncing"])
  }
}

/* Computations */
const proto = PollResults.prototype

proto.$define("length", ["votes", "results"], function () {
  return this.votes.length
})

proto.$define("timeSinceOpen", ["record"], function () {
  if (!this.record) return

  const openingTimeDiff = Date.now() - new Date(this.record.created_at)
  const prettyDiff = prettyInterval(openingTimeDiff)
  return `Open since ${prettyDiff}`
})

/* Helpers */
const helpers = PollResults.helpers
helpers.toResultsMember = x => new PollResults.Member(x)

/* Helpers */
function prettyInterval (ms) {
  const prettyFull = prettyMs(ms, { verbose: true })
  const prettyShort = prettyFull
    .split(" ")
    .slice(0, 2)
    .join(" ")
  return prettyShort
}

/* Export */
PollResults.Member = require("./poll-results.member")
module.exports = PollResults
