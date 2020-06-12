"use strict"
/**
 * Generic Application View
 **/
const { View } = require("@kisbox/browser")

const {
  extractPagename,
  extractQuery,
  extractHash
} = require("@cosmic-plus/helpers")

const Parameters = require("./parameters")

/* Definition */
class Application extends View {
  static forLocation (location) {
    const url = String(location)

    const query = extractQuery(url)
    const hash = extractHash(url)

    const params = Parameters.fromQuery(query)
    params.selectedTabId = extractPagename(hash.substr(1)) || undefined

    return new this(params)
  }

  constructor (params) {
    super(`
<div class="Application">
  %header
  <main>%selectedTabView</main>
  %footer
</body>
    `)

    this.$import(params, ["selectedTabId", "name", "logo", "navigation"])

    this.header = new Application.Header(params)
    this.footer = new Application.Footer(params)

    this.$import(this.header, ["navigation"])
    this.navigation.$link(this, ["selectedTabView", "selectedTabId"])
    this.tabs = this.navigation.tabs
  }
}

/* Defaults */
const proto = Application.prototype
proto.navigation = null
proto.query = ""
proto.hash = ""

/* Computations */
proto.$define("route", ["query", "hash"], function () {
  return this.hash ? `${this.query}#${this.hash}` : `${this.query}`
})

/* Events */
proto.$on("selectedTabId", () => window.scrollTo(0, 0))

/* Export */
Application.Header = require("./application.header")
Application.Footer = require("./application.footer")
module.exports = Application
