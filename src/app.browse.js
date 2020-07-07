"use strict"
/**
 * CosmicVote.BrowseTab
 * */
const { View } = require("@kisbox/browser")

const PollsTable = require("./view/polls-table")

/* Definition */

class BrowseTab extends View {
  constructor (app) {
    super(`
<section class="Widget">
  <h2>Browse Polls</h2>
  <hr>

  %pollsTable
  <hr>

  <aside>
    <p>At creation, polls contract can ping one or several accounts by sending
    them the smallest possible amount of XLM. Accounts that get pinged that way
    serve as polls inbox. All the contracts that are sent to them can be listed
    & tracked at once.</p>
  </aside>

</section>
    `)

    /* Imports */
    this.app = app
    this.pollsTable = new PollsTable(app)

    /* Events */
    this.pollsTable.$on("clickPoll", ([poll]) => this.selectPoll(poll))
  }

  selectPoll (poll) {
    this.app.poll = poll
    this.app.selectedTabId = "results"
  }
}

/* Export */
module.exports = BrowseTab
