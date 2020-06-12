"use strict"
/**
 * Icon
 * */
const { View } = require("@kisbox/browser")

/* Definition */

class Icon extends View {
  constructor (params) {
    super(`
<a class="Icon" %href %title target="_blank" rel="noopener">
  %img
</a>
    `)

    this.$import(params, ["href", "title", "file"])
  }
}

/* Computations */
const proto = Icon.prototype

proto.$define("img", ["file"], function () {
  if (this.file[0] === "<") {
    return new View(this.file)
  } else {
    return new View("<img src=%file %title>", this)
  }
})

/* Export */
module.exports = Icon
