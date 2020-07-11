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
    <a onclick=%openRegister hidden=%has:syncing>View</a>
  </div>

</form>
    `)

    this.$import(pollsTable, ["networkId", "pollsInbox", "syncing"])
  }
}

/* Export */
module.exports = PollsTableControls
