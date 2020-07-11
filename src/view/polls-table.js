"use strict"
/**
 * PollsTable
 * */
const { View } = require("@kisbox/browser")
const { type } = require("@kisbox/utils")

const PassiveContract = require("../model/passive-contract")
const PollContract = require("../model/poll-contract")

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
    <td colspan="3">%controls</td>
  </tfoot>

</table>
    `)

    /* Imports */
    this.$import(params, ["network", "pollsInbox"])

    /* Controls */
    this.controls = new PollsTable.Controls(this)
    this.$import(this.controls, ["networkId", "pollInbox"])
  }

  openRegister () {
    const networkEndpoint = this.networkId === "public" ? "public" : "testnet"
    const handler = `https://stellar.expert/explorer/${networkEndpoint}/account`
    const url = `${handler}/${this.pollsInbox}`
    open(url, null, "noreferrer")
  }

  /* Events */
  clickPoll () {}
}

/* Computations */
const proto = PollsTable.prototype

proto.$define("networkId", ["network"], function () {
  return this.network.id
})

proto.$customDefine("syncing", ["polls"], function () {
  return type(this.polls) === "promise"
})

proto.$define("polls", ["messages"], function () {
  return this.messages.inbox
    .filter(message => message.object.match(/^~majority-judgment@/))
    .map(contract => {
      const poll = PollContract.fromPassiveContract(contract)
      poll.getVotes()
      return poll
    })
})

proto.$define("messages", ["pollsInbox", "networkId"], async function () {
  return await PassiveContract.listMessages(this.pollsInbox, this.networkId)
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
PollsTable.Controls = require("./polls-table.controls")
PollsTable.Row = require("./polls-table.row")
module.exports = PollsTable
