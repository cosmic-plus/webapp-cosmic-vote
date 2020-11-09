"use strict"
/**
 * CosmicVote.NewPollTab
 */
const { View } = require("@kisbox/browser")
const { noError } = require("@kisbox/helpers")

const PollContract = require("./model/poll-contract")
const PollEditor = require("./view/poll-editor")
const ShareLink = require("./view/share-link")

const SideFrame = require("cosmic-lib/es5/helpers/side-frame")

/* Definition */

class NewPollTab extends View {
  constructor (app) {
    super(`
<section class="Widget">
  %shareLink

  <h2>New Poll</h2>
  <hr>

  %pollEditor

  <form class="Controls">
    <input type="button" value="Post That Poll :)" onclick=%postPoll
      hidden=%has:syncing disabled=%error>
    <div hidden=%not:syncing>
      <button type="button" disabled>
        <span class="Spinner"></span>
        <span>Waiting for consensus...</span>
      </button>
      <br>
      <a onclick=%cancelSyncing>Cancel</a>
    </div>
    <br>
    <span class="error">%error</span>
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
    this.error = null

    /* Imports */
    this.app = app
    this.$import(app, ["network"])

    /* Components */
    this.shareLink = new ShareLink(this)
    this.pollEditor = new PollEditor(this)
    this.pollEditor.members.push("Foo")
    this.pollEditor.members.push("Bar")

    /* Events */
    this.pollEditor.$on(["$set"], () => this.error = null)
  }

  async postPoll () {
    this.pollEditor.normalize()
    this.poll = new PollContract(this.pollEditor)

    try {
      const link = this.poll.toCosmicLink()

      const frame = new SideFrame(link)
      const frameClosed = new Promise((resolve) => {
        frame.listen("destroy", resolve)
      })
      frameClosed.then(() => this.syncing = true)

      await this.poll.waitValidation(180).catch(() => {
        throw null
      })
      noError(() => frame.close())
      await frameClosed

      this.app.poll = this.poll
      this.app.poll.network = this.network
      this.app.selectedTabId = "vote"
    } catch (error) {
      if (error === null) return
      console.error(error)
      this.error = error
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
