"use strict"
/**
 * Storage Abstraction
 *
 * Provides some basic typing thanks to JSON stringify/parse.
 **/

const { LiveObject } = require("@kisbox/model")

const store = localStorage

/* Definition */
class Storage extends LiveObject {
  constructor (params) {
    super()

    for (let key in params) {
      if (key in store) {
        try {
          this[key] = JSON.parse(store[key])
        } catch (error) {
          console.warn(`Reading '${key}' from Cosmic.link v1 configuration`)
          this[key] = store[key]
        }
      } else {
        this[key] = params[key]
      }
      this.$export(store, key, JSON.stringify)
    }
  }

  static rename (from, to, transform) {
    if (!(from in store)) return
    store[to] = transform ? transform(store[from]) : store[from]
    delete store[from]
  }
}

/* Export */
module.exports = Storage
