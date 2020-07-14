"use strict"
/**
 * CosmicVote.NewPollTab
 */
const { View } = require("@kisbox/browser")

const PollEditor = require("./view/poll-editor")
const PollContract = require("./model/poll-contract")

const SideFrame = require("cosmic-lib/es5/helpers/side-frame")

/* Definition */

class NewPollTab extends View {
  constructor (app) {
    super(`
<section class="Widget">
  <h2>New Poll</h2>
  <hr>

  %pollEditor

  <form class="Controls">
    <input type="button" value="Post That Poll :)" onclick=%postPoll
      hidden=%has:syncing>
    <div hidden=%not:syncing>
      <button type="button" disabled>
        <span class="Spinner"></span>
        <span>Waiting for consensus...</span>
      </button>
      <br>
      <a onclick=%cancelSyncing>Cancel</a>
    </div>
  </form>

  <aside>
    <hr>

    <p>A poll contract is made of poll parameters embedded into a Stellar
    transaction. Once submitted to the network, the transaction ID serves as the
    contract address. The contract also creates an account to which votes can be
    sent, and eventually ping one or several listing accounts.</p>

    <p>In general, a poll contract consumes between 2 and 5 operations, while a
    vote cost 2 operations.</p>

  </aside>
</section>
    `)

    /* Defaults */
    this.syncing = null

    /* Imports */
    this.app = app
    this.$import(app, ["network"])

    /* Components */
    this.pollEditor = new PollEditor(this)
    this.pollEditor.members.push("Foo")
    this.pollEditor.members.push("Bar")
  }

  async postPoll () {
    this.poll = new PollContract(this.pollEditor)
    const link = this.poll.toCosmicLink()
    const frame = new SideFrame(link)

    const frameClosed = new Promise(resolve => {
      frame.listen("destroy", resolve)
    })
    await frameClosed
    this.syncing = true

    try {
      await this.poll.waitValidation(60)
      this.app.poll = this.poll
      this.app.selectedTabId = "vote"
    } catch (error) {
      console.error(error)
    }

    this.syncing = false
  }

  cancelSyncing () {
    this.poll.syncing = false
    this.syncing = false
  }
}

/* Export */
module.exports = NewPollTab
