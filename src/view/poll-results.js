"use strict"
/**
 * Poll Results
 * */
const { View } = require("@kisbox/browser")

/* Definition */

class PollResults extends View {
  constructor (poll) {
    super(`
<div class="PollResults">

  <ol>
    %{toResultsMember:...results}
  </ol>

  <footer hidden=%has:syncing>
    <span>Open since %{age}</span>
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

proto.$define("age", ["record"], function () {
  const timeDiff = Date.now() - new Date(this.record.created_at)
  const daysDiff = Math.trunc(timeDiff / (1000 * 3600 * 24))

  if (daysDiff === 0) {
    return "today"
  } else if (daysDiff === 1) {
    return "1 day"
  } else {
    return `${daysDiff} days`
  }
})

/* Helpers */
const helpers = PollResults.helpers
helpers.toResultsMember = x => new PollResults.Member(x)

/* Export */
PollResults.Member = require("./poll-results.member")
module.exports = PollResults
