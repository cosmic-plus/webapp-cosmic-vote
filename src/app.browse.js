"use strict"
/**
 * CosmicVote.BrowseTab
 * */
const { View } = require("@kisbox/browser")

const Parameters = require("./lib/parameters")
const PollsTable = require("./view/polls-table")
const ShareLink = require("./view/share-link")

/* Definition */

class BrowseTab extends View {
  constructor (app) {
    super(`
<section class="Widget">
  %shareLink

  <h2>Browse Polls</h2>
  <hr>

  <div class="side-scroll">%pollsTable</div>

  <aside>
    <hr>

    <p>At creation, polls contract can ping one or several accounts by sending
    them the smallest possible amount of XLM. Accounts that get pinged that way
    serve as polls inbox. All the contracts that are sent to them can be listed
    & tracked at once.</p>

  </aside>

</section>
    `)

    /* Imports */
    this.app = app

    /* Components */
    this.shareLink = new ShareLink({ title: "Browse Polls" })
    this.pollsTable = new PollsTable(app)
    this.$import(this.pollsTable, ["networkId", "pollsInbox"])

    /* Events */
    this.pollsTable.$on("clickPoll", ([poll]) => {
      if (!poll.cursor) poll.getVotes()
      this.selectPoll(poll)
    })
  }

  selectPoll (poll) {
    this.app.poll = poll
    this.app.selectedTabId = "results"
  }
}

/* Computations */
const proto = BrowseTab.prototype

proto.$define("query", ["networkId", "pollsInbox"], function () {
  return Parameters.toQuery({
    pollsInbox: this.pollsInbox,
    network: this.networkId
  })
})

/* Export */
module.exports = BrowseTab
