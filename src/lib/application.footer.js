"use strict"
/**
 * Application Footer
 * */
const { View } = require("@kisbox/browser")

const Icon = require("./icon")

/* Definition */

class ApplicationFooter extends View {
  constructor (params) {
    super(`
<footer class="ApplicationFooter">
  <nav hidden=%not:icons>%Icon:...icons</nav>
  <nav hidden=%not:links>...%links</nav>
</footer>
    `)

    this.$import(params, ["icons", "links"])
  }
}

/* Helpers */
const helpers = ApplicationFooter.helpers
helpers.Icon = x => new Icon(x)

/* Export */
module.exports = ApplicationFooter
