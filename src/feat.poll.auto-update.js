"use strict"
/**
 * Auto-update poll when a vote are pushed, and DELAY have passed since last
 * pushed vote.
 **/
const Poll = require("./model/poll")
const { timeout, $tag } = require("@kisbox/helpers")
const $latestVote = $tag("/latest-vote/")

/* Configuration */

const DELAY = 400

/* Computations */
const proto = Poll.prototype

proto.$on("votes", function (current, previous) {
  if (previous) this.$ignore(previous)
  if (!current) return

  current.$on("$change", async () => {
    const timestamp = +Date.now()
    $latestVote.set(this, timestamp)
    await timeout(DELAY)

    if ($latestVote.get(this) === timestamp) {
      this.computeResults()
    }
  })
})
