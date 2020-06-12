"use strict"
/**
 * CosmicVote.NewPollTab
 */
const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

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

  <hr>
  <form class="Controls">
    <input type="button" value="Post" onclick=%postPoll
      hidden=%has:syncing>
    <div hidden=%not:syncing>
      <button type="button" disabled>
        <span class="Spinner"></span>
        <span>Waiting for consensus...</spans>
      </button>
      <br>
      <a onclick=%cancelSyncing>Cancel</a>
    </div>
  </form>

</section>
    `)

    /* Defaults */
    this.syncing = null

    /* Imports */
    this.app = app
    this.pollEditor = new PollEditor()
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

    await this.poll.waitValidation(60)
    if (!this.poll.txHash) return

    this.app.poll = this.poll
    this.app.selectedTabId = "vote"

    this.syncing = false
  }

  cancelSyncing () {
    this.poll.syncing = false
    this.syncing = false
  }
}

/* Computations */
const proto = NewPollTab.prototype

proto.$customDefine("postButtonValue", ["sync"], function () {
  if (type(this.syncing) === "promise") {
    return "Waiting for Stellar consensus..."
  } else {
    return "Post"
  }
})

/* Export */
module.exports = NewPollTab
