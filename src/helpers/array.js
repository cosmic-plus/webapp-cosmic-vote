"use strict"
/**
 * Array Helpers
 * */
const my = exports

/* Library */

my.sum = function (array) {
  return array.reduce((sum, x) => sum + x, 0)
}

my.remove = function (array, item) {
  const index = array.indexOf(item)
  if (index === -1) return
  array.splice(index, 1)
}
