"use strict"
/**
 * View.attributes extension.
 * */
const { View, html } = require("@kisbox/browser")
const { stringToHtml } = require("./html")

/* Extension */

View.attributes.hint = function (view, domNode, value) {
  const helpCircle = require("feather-icons/dist/icons/help-circle.svg")
  html.append(domNode, stringToHtml(helpCircle))
  domNode.dataset.hint = value
}
