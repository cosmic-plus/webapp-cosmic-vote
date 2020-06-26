"use strict"
/**
 * CosmicVote.VoteTab
 */
const { View } = require("@kisbox/browser")

const NetworkContext = require("./model/network-context")
const PollVoteForm = require("./view/poll-vote-form")

/* Definition */

class VoteTab extends View {
  constructor (app) {
    super(`
<section class="Widget">
  <h2 hidden=%not:syncing>Reading Contract...</h2>
  <h2 hidden=%has:syncing>%sectionTitle</h2>
  <hr>
  
  <nav hidden=%not:syncing>
    <span class="Spinner"></span>
    <span>Please wait...</span>
  </nav>
  <nav hidden=%has:syncing>
    <a onclick=%openTransaction hidden=%not:txHash>View contract</a>
    <a onclick=%openState hidden=%not:txHash>View state</a>
    <a onclick=%showResultsTab>See results</a>
  </nav>

  %voteForm

  <form class="Controls">
    <input type="button" value="Cast Your Vote!" onclick=%postVote
      hidden=%has:waitingForVote>
    <div hidden=%not:waitingForVote>
      <button type="button" disabled>
        <span class="Spinner"></span>
        <span>Waiting for consensus...</span>
      </button>
      <br>
      <a onclick=%cancelSyncing>Cancel</a>
    </div>
  </form>

  <hr>

  <aside>
    <p><strong>When you don't have an opinion about a candidate, please leave it
    with the "Indifferent" grade.</strong></p>

    <p><strong>Majority Judgment</strong> is a voting system in which voters can
    assign a grade to as many candidates as they wish.</p>

    <p>Grades are ranked from the worst to the best, and belong to one of three
    categories. The first category expresses rejection ("Dismissed",
    "Insufficient"). The second category expresses indecision ("Indifferent").
    The last category expresses a level of consent ("Passable", "Good",
    "Excellent").</p>

    <p>The candidates that get grades "Passable" to "Excellent" are the only
    ones to be considered as suitable for the voter. A candidate with an
    "Indifferent" mention is not explicitly rejected but is not considered
    suitable either because explicit consent has not been given. This is
    equivalent to a white vote.</p>
  </aside>

</section>
    `)

    /* Defaults */
    this.txHash = null
    this.network = null
    this.waitingForVote = false

    /* Imports */
    this.app = app
    this.$import(app, ["poll", "txHash", "syncing", "title"])
  }

  async postVote () {
    const vote = this.voteForm.vote
    const frame = this.poll.postVote(vote)

    const frameClosed = new Promise(resolve => {
      frame.listen("destroy", resolve)
    })
    await frameClosed
    this.waitingForVote = true

    try {
      await this.poll.waitForVote(vote, 60)
      this.poll.computeResults()
      this.app.selectedTabId = "results"
    } catch (error) {
      console.error(error)
    }

    this.waitingForVote = false
  }

  cancelSyncing () {
    this.waitingForVote = false
  }

  showResultsTab () {
    this.app.selectedTabId = "results"
  }

  openTransaction () {
    const network = NetworkContext.normalize(this.poll.network)
    const networkEndpoint = network.id === "public" ? "public" : "testnet"
    const handler = `https://stellar.expert/explorer/${networkEndpoint}/tx`
    const url = `${handler}/${this.txHash}`
    open(url, null, "noreferrer")
  }

  openState () {
    const network = NetworkContext.normalize(this.poll.network)
    const networkEndpoint = network.id === "public" ? "public" : "testnet"
    const handler = `https://stellar.expert/explorer/${networkEndpoint}/account`
    const url = `${handler}/${this.poll.state}`
    open(url, null, "noreferrer")
  }
}

/* Computations */
const proto = VoteTab.prototype

proto.$define("sectionTitle", ["title"], function () {
  return this.title || "Your Opinion Matters"
})

proto.$define("voteForm", ["poll"], function () {
  return new PollVoteForm(this.poll)
})

/* Export */
module.exports = VoteTab
