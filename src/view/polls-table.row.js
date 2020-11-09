"use strict"
/**
 * PollsTable.Row
 * */
const { View } = require("@kisbox/browser")

const prettyMs = require("pretty-ms")

/* Definition */

class PollsTableRow extends View {
  constructor (poll) {
    super(`
<tr title="%membersNames">
  <td>%date</td>
  <td>%title</td>
  <td>%timeBeforeClose</td>
</tr>
    `)

    this.$import(poll, [
      "title",
      "record",
      "results",
      "syncing",
      "members",
      "maxTime"
    ])
  }
}

/* Computations */
const proto = PollsTableRow.prototype

proto.$define("date", ["record"], function () {
  const date = new Date(this.record.created_at)
  const shortDate = date.toLocaleDateString()
  return shortDate
})

proto.$define("membersNames", ["members"], function () {
  return this.members.join("\n")
})

proto.$define("timeBeforeClose", ["maxTime"], function () {
  if (!this.maxTime) return "Never"

  const closingTimeDiff = this.maxTime - Date.now()
  const prettyDiff = prettyInterval(Math.abs(closingTimeDiff))

  if (closingTimeDiff > 0) {
    return `In ${prettyDiff}`
  } else {
    return `Closed`
  }
})

/* Helpers */
function prettyInterval (ms) {
  const prettyFull = prettyMs(ms, { verbose: true })
  const prettyShort = prettyFull.split(" ").slice(0, 2).join(" ")
  return prettyShort
}

/* Export */
module.exports = PollsTableRow
