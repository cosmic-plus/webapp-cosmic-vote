"use strict"
/**
 * PollsTable.Controls
 * */
const { View } = require("@kisbox/browser")

/* Definition */

class PollsTableControls extends View {
  constructor (pollsTable) {
    super(`
<form class="PollsTable.Controls">

  <div><span>Network:</span>
    <select value=%networkId>
      <option value="public">Public</option>
      <option value="test">Test</option>
    </select>
  </div>

  <div>
    <span>Reading:</span>
    <input type="text" value=%pollsInbox readonly>
    <span class="Spinner" hidden=%not:syncing></span>
    <a onclick=%openInbox hidden=%has:syncing>View</a>
  </div>

</form>
    `)

    this.$import(pollsTable, ["networkId", "pollsInbox", "syncing"])
  }

  openInbox () {
    const networkEndpoint = this.networkId === "public" ? "public" : "testnet"
    const handler = `https://stellar.expert/explorer/${networkEndpoint}/account`
    const url = `${handler}/${this.pollsInbox}`
    open(url, null, "noreferrer")
  }
}

/* Export */
module.exports = PollsTableControls
