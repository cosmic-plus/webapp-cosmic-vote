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
