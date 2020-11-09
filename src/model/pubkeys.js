"use strict"
/**
 * Pubkeys
 * */
const { LiveArray } = require("@kisbox/model")
const { xeach } = require("@kisbox/helpers")

/* Definition */

class Pubkeys extends LiveArray {
  constructor () {
    super()
  }

  ingest (collection) {
    if (!collection) return

    if (typeof collection === "string") {
      collection = JSON.parse(collection)
    }

    xeach(collection, (item) => this.put(item))
  }

  put (pubkey) {
    if (this.includes(pubkey)) return
    this.push(pubkey)
  }

  /* Storage */
  $store (key, target = localStorage) {
    if (key in target) this.ingest(target[key])
    this.$on("$change", () => target[key] = this.toJson())
  }

  /* Formats */
  toJson () {
    return JSON.stringify(this)
  }
}

/* Export */
module.exports = Pubkeys
