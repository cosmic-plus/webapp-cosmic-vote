"use strict"
/**
 * PollVoteFormItem
 */
const { View } = require("@kisbox/browser")

const { gaugeMeter } = require("@cosmic-plus/helpers")

/* Definition */

class PollVoteFormItem extends View {
  constructor (params) {
    super(`
<li>
  <span class="id">%id</span>
  %gaugeMeter
</li>
    `)

    this.gaugeMeter = gaugeMeter({
      gauge: [1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6, 1 / 6],
      names: [
        "Dismissed",
        "Insufficient",
        "Indifferent",
        "Passable",
        "Good",
        "Excellent"
      ]
    })

    // Set Gauge Events
    this.gaugeMeter.childNodes.forEach((span, index) => {
      span.onclick = () => this.value = index
    })

    this.$import(params, ["id", "value"])
  }
}

/* Computations */
const proto = PollVoteFormItem.prototype

proto.$on("value", function (value) {
  this.gaugeMeter.childNodes.forEach((span, index) => {
    span.className = index === value ? "selected" : ""
  })
})

/* Export */
module.exports = PollVoteFormItem
