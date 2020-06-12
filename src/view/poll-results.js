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

  <footer>Number of votes: %{length}</footer>
</div>
    `)

    this.$import(poll, ["results", "votes"])
  }
}

/* Computations */
const proto = PollResults.prototype

proto.$define("length", ["votes", "results"], function () {
  return this.votes.length
})

/* Helpers */
const helpers = PollResults.helpers
helpers.toResultsMember = x => new PollResults.Member(x)

/* Export */
PollResults.Member = require("./poll-results.member")
module.exports = PollResults
