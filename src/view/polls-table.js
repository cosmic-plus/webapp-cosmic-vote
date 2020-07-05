"use strict"
/**
 * PollsTable
 * */
const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const PassiveContract = require("../model/passive-contract")
const PollContract = require("../model/poll-contract")
const NetworkContext = require("../model/network-context")

/* Definition */

class PollsTable extends View {
  constructor (params) {
    super(`
<table class="PollsTable">

  <thead>
    <th>Date</th>
    <th>Title</th>
    <th>Votes</th>
  </thead>

  <tbody>
    %toRow:...polls
  </tbody>

  <tfoot>
    <td colspan="3">
      <span class="Spinner" hidden=%not:syncing></span>
      <input type="text" value=%pollsInbox $label="Reading from:" readonly>
      <a onclick=%openRegister>View</a>
    </td>
  </tfoot>

</table>
    `)

    /* Imports */
    this.$import(params, ["network", "pollsInbox"])
  }

  openRegister () {
    const network = NetworkContext.normalize(this.network)
    const networkEndpoint = network.id === "public" ? "public" : "testnet"
    const handler = `https://stellar.expert/explorer/${networkEndpoint}/account`
    const url = `${handler}/${this.pollsInbox}`
    open(url, null, "noreferrer")
  }

  /* Events */
  clickPoll () {}
}

/* Computations */
const proto = PollsTable.prototype

proto.$customDefine("syncing", ["polls"], function () {
  return type(this.polls) === "promise"
})

proto.$define("polls", ["messages"], function () {
  return this.messages.inbox
    .filter(message => message.object.match(/^~majority-judgment@/))
    .map(contract => PollContract.fromPassiveContract(contract))
})

proto.$define("messages", ["pollsInbox", "network"], async function () {
  return await PassiveContract.listMessages(this.pollsInbox, this.network)
})

proto.$on("messages", function (current, previous) {
  if (previous && previous.stopStream) {
    previous.stopStream()
  }
  if (current && current.stream) {
    current.stream()
  }
})

/* Helpers */
const helpers = PollsTable.helpers

helpers.toRow = function (poll) {
  const row = new PollsTable.Row(poll)
  row.domNode.onclick = () => this.clickPoll(poll)
  return row
}

/* Export */
PollsTable.Row = require("./polls-table.row")
module.exports = PollsTable