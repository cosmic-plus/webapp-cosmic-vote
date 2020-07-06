"use strict"
/**
 * CosmicVote.Results
 */
const { View } = require("@kisbox/browser")

const NetworkContext = require("./model/network-context")
const PollResults = require("./view/poll-results")

/* Definition */

class ResultsTab extends View {
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
    <a onclick=%showVoteTab>Vote</a>
  </nav>

  %results

  <hr>

  <aside>
    <p>Each candidate's votes are sorted from the worst to the best grade. We
    take the candidate median grade, which we call the "majority grade", to be
    the result of that candidate. If a candidate gets a "good" grade, we know
    that a majority of voters consider that the candidate is <i>at most
    good</i>, while another (overlapping) majority of voters thinks the
    candidate is <i>at least good</i>.</p>

    <p>To break ties, we join completion of the grade to the result. The
    completion can be determined graphically, as it represents the point where
    the median cut the grade. If the median cut the grade right at its start,
    the completion is 0%. If it cuts it at the end, it is 100%. If it cuts it in
    the middle, then it is 50%, and so on...</p>

    <p>The complete result is noted <code>Grade<sub>+completion</sub></code> and
    represents the level of support or rejection the community has for a given
    candidate. The ranking is obtained by sorting candidates this way: first by
    grade, then by completion.</p>

    <p>Worth noting, each candidate has a score that has a meaning of its own.
    This is fundamentally different from traditional voting systems, in which
    adding or removing a candidate will change other candidates' scores (and,
    more often than not, the whole ranking in disturbing ways).</p>
  </aside>

</section>
    `)

    this.app = app
    this.$import(app, ["poll", "txHash", "title", "syncing"])
  }

  showVoteTab () {
    this.app.selectedTabId = "vote"
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
const proto = ResultsTab.prototype

proto.$define("sectionTitle", ["title"], function () {
  return this.title || "Check Those Results!"
})

proto.$define("results", ["poll"], function () {
  this.poll.computeResults()
  return new PollResults(this.poll)
})

/* Export */
module.exports = ResultsTab
