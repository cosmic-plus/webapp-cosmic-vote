"use strict"
/**
 * CosmicVote.WelcomeTab
 **/
const { html } = require("@kisbox/browser")

/* Definition */

class WelcomeTab {
  constructor () {
    const className = "Widget"
    const innerHTML = WelcomeTab.html
    return html("section", { className, innerHTML })
  }
}

/* Export */
WelcomeTab.html = require("./bundled/welcome.md")
module.exports = WelcomeTab
