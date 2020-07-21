"use strict"
/**
 * PollVoteForm
 */
const { View } = require("@kisbox/browser")

/* Definition */

class PollVoteForm extends View {
  constructor (poll) {
    super(`
<ul class="PollVoteForm">
  ...%entries
</ul>
    `)

    /* Defaults */
    this.members = []

    /* Imports */
    this.$import(poll, ["members"])

    // Entries events
    this.entries.forEach((li, index) => {
      this.$listen(li, ["value"], value => {
        this.vote[index] = value
      })
    })
  }

  resetVote () {
    this.vote = new Array(this.members.length).fill(2)
  }
}

/* Computations */
const proto = PollVoteForm.prototype

proto.$on("members", function () {
  this.resetVote()
})

proto.$on("vote", function (vote) {
  if (!this.entries) return
  this.entries.forEach((entry, index) => {
    entry.value = vote ? vote[index] : 2
  })
})

proto.$define("entries", ["members"], function () {
  return this.members.map((id, index) => {
    const entry = new PollVoteForm.Item({ id, value: this.vote[index] })
    entry.$on("value", value => this.vote[index] = value)
    return entry
  })
})

/* Export */
PollVoteForm.Item = require("./poll-vote-form.item")
module.exports = PollVoteForm
