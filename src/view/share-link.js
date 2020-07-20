"use strict"
/**
 * ShareLink
 * */
const { View, html } = require("@kisbox/browser")
const { timeout } = require("@kisbox/helpers")

const { stringToHtml } = require("@cosmic-plus/helpers")

const shareIcon = require("feather-icons/dist/icons/share-2.svg")

/* Definition */

class ShareLink extends View {
  constructor (params) {
    super(`
<div class="ShareLink">
  <span class=%state>Link copied!</span>
  <a %onclick>%shareSvg</a>
</div>
`)
    /* Default */
    this.state = null

    /* Imports */
    this.$import(params, ["title"])

    /* Components */
    this.shareSvg = stringToHtml(shareIcon)
  }

  async onclick () {
    if (this.state) return

    if (navigator.share) {
      navigator.share({
        title: this.title,
        url: location
      })
    } else {
      html.copyString(location.href)
      this.state = "activated"
      await timeout(2000)
      this.state = null
    }
  }
}

/* Export */
module.exports = ShareLink
