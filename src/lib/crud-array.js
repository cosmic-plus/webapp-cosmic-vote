"use strict"
/**
 * CrudArray
 */
const { LiveArray } = require("@kisbox/model")
const { xeach, hide } = require("@kisbox/helpers")

/* Definition */

class CrudArray extends LiveArray {
  constructor (Class = Object) {
    super()
    hide(this, "Class", Class)
  }

  /* Storage */
  $store (target, key) {
    if (key in target) this.ingest(target[key])
    this.$on("$change", () => target[key] = this.toJson())
  }

  /* Formats */
  toObject () {
    return this.map((x) => x.toObject())
  }

  toJson () {
    return JSON.stringify(this.toObject())
  }

  ingest (collection) {
    if (!collection) return

    if (typeof collection === "string") {
      collection = JSON.parse(collection)
    }

    xeach(collection, (params, id) => {
      const item = this.put(params)
      if (!item.id) item.id = id
    })
  }

  /* Primitives */
  put (params) {
    const item = want(this.Class, params)
    this.delete(item.id)
    this.push(item)
    return item
  }

  get (id) {
    return this.find((x) => x.id === id)
  }

  delete (id) {
    const index = this.findIndex((x) => x.id === id)
    if (index !== -1) this.splice(index, 1)
  }
}

/* Events */
const proto = CrudArray.prototype

proto.$on("$add", function ([item]) {
  this.$listen(item, "$set", () => {
    this.$trigger("$change")
  })
})

proto.$on("$remove", function ([item]) {
  this.$ignore(item, "$set")
})

/* Helpers */

function want (Class, params) {
  return params instanceof Class ? params : new Class(params)
}

/* Export */
module.exports = CrudArray
