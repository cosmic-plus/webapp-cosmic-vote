"use strict"
/**
 * Navigation
 * */
const { View, html } = require("@kisbox/browser")

const CrudArray = require("./crud-array")

/* Definition */

class Navigation extends View {
  constructor (tabs = []) {
    super(`
<div class="Navigation">
  <nav>%toNavigationLink:...tabs</nav>
  <select value=%selectedTabId>
    %toNavigationOption:...tabs
  </select>
</div>
    `)

    this.tabs = CrudArray.from(tabs)
  }
}

/* Helpers */
const helpers = Navigation.helpers

helpers.toNavigationLink = function (tab) {
  const link = html("a", null, tab.title)
  link.onclick = () => this.selectedTabId = tab.id

  this.$on("selectedTabId", selectedTabId => {
    link.className = selectedTabId === tab.id ? "selected" : ""
  })

  if (!this.selectedTabId && tab.default) {
    this.selectedTabId = tab.id
  }

  return link
}

helpers.toNavigationOption = function (tab) {
  return html("option", { value: tab.id }, tab.title)
}

/* Computations */
const proto = Navigation.prototype

proto.$define("selectedTabView", ["selectedTabId", "tabs"], function () {
  const tab = this.tabs.find(t => t.id === this.selectedTabId)
  if (!tab) return

  if (typeof tab.view === "function") {
    return tab.view()
  } else {
    return tab.view
  }
})

/* Export */
module.exports = Navigation
