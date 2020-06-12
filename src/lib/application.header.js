"use strict"
/**
 * Application Header
 */
const { View } = require("@kisbox/browser")

const Navigation = require("./navigation")

/* Definition */
class ApplicationHeader extends View {
  constructor (params) {
    super(`
<header class="ApplicationHeader">
  <h1>%{logo}%{name}</h1>
  %navigation
</header>
    `)

    this.$import(params, ["logo", "name", "navigation"])
    this.navigation = new Navigation(params.navigation)
  }
}

/* Export */
module.exports = ApplicationHeader
