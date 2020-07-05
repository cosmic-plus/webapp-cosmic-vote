"use strict"
/**
 * PollsTable.Row
 * */
const { View } = require("@kisbox/browser")

/* Definition */

class PollsTableRow extends View {
  constructor (poll) {
    super(`
<tr title="%membersNames">
  <td>%date</td>
  <td>%title</td>
  <td>
    <span class="Spinner" hidden=%not:syncing></span>
    <span hidden=%has:syncing>%votesLength</span>
  </td>
</tr>
    `)

    this.$import(poll, [
      "title",
      "votes",
      "record",
      "results",
      "syncing",
      "members"
    ])
  }
}

/* Computations */
const proto = PollsTableRow.prototype

proto.$define("votesLength", ["results"], function () {
  return this.votes.length
})

proto.$define("date", ["record"], function () {
  const date = new Date(this.record.created_at)
  const shortDate = date.toLocaleDateString()
  return shortDate
})

proto.$define("membersNames", ["members"], function () {
  return this.members.join("\n")
})

/* Export */
module.exports = PollsTableRow
