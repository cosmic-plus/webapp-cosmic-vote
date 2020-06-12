"use strict"
/**
 * Poll Results Member
 * */
const { View } = require("@kisbox/browser")

const { nice } = require("@cosmic-plus/utils")
const { gaugeMeter } = require("@cosmic-plus/helpers")

/* Definition */

class PollResultsMember extends View {
  constructor (result) {
    super(`
<li>
  <span class="id">%{id}</span>
  <span class="grade">%grade <sub>+%percentage</sub></span>
  %gaugeMeter
</li>
    `)

    this.$import(result, ["id", "gauge", "grade", "completion"])
  }
}

/* Computations */
const proto = PollResultsMember.prototype

proto.$define("gaugeMeter", ["gauge"], function () {
  return gaugeMeter({ gauge: this.gauge })
})

proto.$define("percentage", ["completion"], function () {
  return `${nice(100 * this.completion, { significant: 2 })}%`
})

/* Helpers */
const helpers = PollResultsMember.helpers
helpers.gaugeMeter = gaugeMeter

/* Export */
module.exports = PollResultsMember
