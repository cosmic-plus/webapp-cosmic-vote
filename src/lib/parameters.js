"use strict"
/**
 * Parameters
 * */
const { xassoc } = require("@kisbox/helpers")

/* Definition */
class Parameters {}

/* Format: Query */
Parameters.fromQuery = function (query, Constructor = Object) {
  const params = new Constructor()
  if (query === "") {
    return params
  } else if (query[0] !== "?") {
    throw new TypeError(`Not a query: ${query}`)
  }

  const defs = query.substr(1).split("&")
  defs.forEach((assignment) => {
    if (!assignment.length) return
    const key = assignment.split("=")[0]
    const value = assignment.substr(key.length + 1)
    params[key] = decodeURIComponent(value)
  })

  return params
}

Parameters.toQuery = function (params) {
  let query = ""
  xassoc(params, (value, key) => {
    if (value == null) return
    query += `&${key}=${encodeURIComponent(value)}`
  })

  return `?${query.substr(1)}`
}

/* Format: Json */
Parameters.fromJson = function (json) {
  return Object.assign(new Parameters(), JSON.parse(json))
}

Parameters.toJson = function (params) {
  return JSON.stringify(params, null, 2)
}

/* Export */
module.exports = Parameters
