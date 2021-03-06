"use strict"
/**
 * CosmicVote.VoteTab
 */
const { View } = require("@kisbox/browser")
const { noError } = require("@kisbox/helpers")

const SideFrame = require("cosmic-lib/es5/helpers/side-frame")

const Parameters = require("./lib/parameters")
const NetworkContext = require("./model/network-context")
const BallotSelector = require("./view/ballots-selector")
const PollConditionsList = require("./view/poll-conditions-list")
const PollVoteForm = require("./view/poll-vote-form")
const ShareLink = require("./view/share-link")

/* Definition */

class VoteTab extends View {
  constructor (app) {
    super(`
<section class="Widget">
  %shareLink

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
    %ballotSelector
  </nav>

  %voteForm

  <form class="Controls" hidden=%not:title>
    <input type="button" value=%buttonText onclick=%postVote
      hidden=%has:waitingForVote disabled=%disableVoting>
    <div hidden=%not:waitingForVote>
      <button type="button" disabled>
        <span class="Spinner"></span>
        <span>Waiting for consensus...</span>
      </button>
      <br>
      <a onclick=%cancelSyncing>Cancel</a>
    </div>

    %pollConditions
  </form>

  <aside>
    <hr>

    <p><strong>When you don't have an opinion about a candidate, please leave it
    with the "Undecided" grade.</strong></p>

    <p><strong>Majority Judgment</strong> is a voting system in which voters can
    assign a grade to as many candidates as they wish.</p>

    <p>Grades are ranked from the worst to the best, and belong to one of three
    categories. The first category expresses rejection ("Dismissed",
    "Insufficient"). The second category expresses indecision ("Undecided").
    The last category expresses a level of consent ("Passable", "Good",
    "Excellent").</p>

    <p>The candidates that get grades "Passable" to "Excellent" are the only
    ones to be considered as suitable for the voter. A candidate with an
    "Undecided" mention is not explicitly rejected but is not considered
    suitable either because explicit consent has not been given. This is
    equivalent to a blank vote.</p>

    <p><a target="_blank" rel="noopener"
        title="(Medium) Cosmic.vote #1: Introducing Majority Judgment"
        href="https://medium.com/cosmic-plus/cosmic-vote-1-introducing-majority-judgment-84a250380695?source=collection_home---4------0-----------------------">
      Read more about Majority Judgement
    <a></p>

  </aside>

</section>
    `)

    /* Defaults */
    this.txHash = null
    this.ballot = null
    this.userBallots = []
    this.waitingForVote = false
    this.txHandler = "https://test.cosmic.link"

    /* Imports */
    this.app = app
    this.$import(app, [
      "poll",
      "txHash",
      "syncing",
      "title",
      "network",
      "userPubkeys",
      "isClosed",
      "noEdit"
    ])

    /* Components */
    this.shareLink = new ShareLink(this)
    this.ballotSelector = new BallotSelector(this)
    this.$import(this.ballotSelector, ["ballot"])
  }

  async postVote () {
    const vote = this.voteForm.vote
    const txParams = this.poll.voteToTxParams(vote)
    if (this.ballot) txParams.source = this.ballot.id

    const timestamp = new Date()
    timestamp.setMinutes(timestamp.getMinutes() + 3)
    const timecheck = timestamp.toISOString().replace(/\.[0-9]{3}/, "")
    txParams.maxTime = timecheck

    const txQuery = txParams.to("query")
    const txRequest = `${this.txHandler}/${txQuery}`
    const frame = new SideFrame(txRequest)

    const frameClosed = new Promise((resolve) => {
      frame.listen("destroy", resolve)
    })
    frameClosed.then(() => this.waitingForVote = true)

    try {
      const ballot = await this.poll.waitForBallot({ vote, timecheck })
      noError(() => frame.close())
      await frameClosed
      this.userPubkeys.put(ballot.id)
      this.ballot = ballot
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

proto.$define("query", ["txHash", "network"], function () {
  return Parameters.toQuery({
    txHash: this.txHash,
    network: this.network.id
  })
})

proto.$define("disableVoting", ["isClosed", "noEdit", "ballot"], function () {
  return this.isClosed || this.ballot && this.noEdit
})

proto.$define("buttonText", ["ballot", "isClosed"], function () {
  if (this.isClosed) {
    return "Poll closed"
  } else if (this.ballot) {
    if (this.noEdit) {
      return "Edit is forbidden"
    } else {
      return "Edit Your Vote"
    }
  } else {
    return "Cast Your Vote!"
  }
})

proto.$define("pollConditions", ["poll"], function () {
  return new PollConditionsList(this.poll)
})

proto.$on("poll", function () {
  this.poll.localVoters = this.userPubkeys
  this.userBallots = this.poll.localBallots || []

  if (this.userBallots.length > 0) {
    this.ballot = this.userBallots[0]
  }
})

proto.$on("ballot", function () {
  if (!this.voteForm) return
  if (this.ballot) {
    this.voteForm.vote = this.ballot.choice
  } else {
    this.voteForm.resetVote()
  }
})

/* Export */
module.exports = VoteTab
