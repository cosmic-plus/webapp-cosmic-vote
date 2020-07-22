"use strict"
/**
 * PollConditionsList
 * */
const { View, html } = require("@kisbox/browser")

/* Definition */

class PollConditionsList extends View {
  constructor (poll) {
    super(`
<ul class="PollConditionsList">
  %toLine:...conditions
</li>
    `)

    this.$import(poll, ["network", "maxTime", "isClosed", "noEdit"])
  }
}

/* Computations */
const proto = PollConditionsList.prototype

proto.$define(
  "conditions",
  ["network", "maxTime", "isClosed", "noEdit"],
  function () {
    const conditions = []
    if (this.network) {
      conditions.push(`Network: Stellar ${this.network.id}`)
    }
    if (this.maxTime) {
      const date = new Date(this.maxTime)
      const dateString = date.toLocaleString()
      if (this.isClosed) {
        conditions.push(`Closed the ${dateString}`)
      } else {
        conditions.push(`Closes the ${dateString}`)
      }
    }
    if (this.noEdit) {
      conditions.push(`No vote editing`)
    }
    return conditions
  }
)

/* Helpers */
const helpers = PollConditionsList.helpers

helpers.toLine = function (condition) {
  return html("li", { textContent: condition })
}

/* Export */
module.exports = PollConditionsList
