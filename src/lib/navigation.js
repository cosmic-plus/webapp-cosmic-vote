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

    /* Defaults */
    this.query = ""

    /* Components */
    this.tabs = CrudArray.from(tabs)
    this.tabs.$forEach((tab) => this.listenQuery(tab))

    /* Events */
    this.$on("selectedTabView", () => this.refreshQuery())
  }

  listenQuery (tab) {
    const queryHandler = () => this.refreshQuery(tab.view)
    this.$listen(tab.view, "query", queryHandler)
  }

  refreshQuery (view = this.selectedTabView) {
    if (view !== this.selectedTabView) return

    let query = `?tab=${this.selectedTabId}`
    if (view.query && view.query.length > 1) {
      query += `&${view.query.substr(1)}`
    }
    this.query = query
  }
}

/* Helpers */
const helpers = Navigation.helpers

helpers.toNavigationLink = function (tab) {
  const link = html("a", null, tab.title)
  link.onclick = () => this.selectedTabId = tab.id

  this.$on("selectedTabId", (selectedTabId) => {
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
  const tab = this.tabs.find((t) => t.id === this.selectedTabId)
  if (!tab) return

  if (typeof tab.view === "function") {
    return tab.view()
  } else {
    return tab.view
  }
})

/* Export */
module.exports = Navigation
