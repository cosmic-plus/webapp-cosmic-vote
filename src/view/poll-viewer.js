"use strict"
/**
 * Poll Viewer
 */
const { View } = require("@kisbox/browser")

const PollResults = require("./poll-results")
const PollVoteForm = require("./poll-vote-form")

/* Definition */

class PollViewer extends View {
  constructor (poll) {
    super(`
<section class="Widget">
  <h2>Poll Viewer</h2>
  <hr>

  <section $step="1">
    <h3>Cast Your Vote!</h3>
    %voteForm
    <form>
      <button onclick=%vote>Cast Your Vote!</button>
      <br>
      <a onclick=%showResults>See results</a>
    </form>
  </section>
  
  <section $step="2">
    <h3>Check That Results!</h3>
    %results
    <form>
      <a onclick=%showVoteForm hidden=%hasVoted>Back</a>
    </form>
  </section>

</section>
    `)

    this.poll = poll
    this.step = 1
  }

  vote () {
    this.poll.votes.push(this.voteForm.vote)
    this.poll.computeResults()
    this.hasVoted = true

    this.showResults()
  }

  showResults () {
    this.step = 2
  }

  showVoteForm () {
    this.step = 1
  }
}

/* Computations */
const proto = PollViewer.prototype

proto.$define("voteForm", ["poll"], function () {
  return new PollVoteForm(this.poll)
})

proto.$define("results", ["poll"], function () {
  return new PollResults(this.poll)
})

/* View extension */

View.attributes.step = function (view, domNode, value) {
  view.$on("step", step => domNode.hidden = step != value)
}

/* Export */
module.exports = PollViewer
