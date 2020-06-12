"use strict"
/**
 * OcMessageSender
 */
const { View } = require("@kisbox/browser")
const { wrap } = require("@kisbox/helpers")

const SideFrame = require("cosmic-lib/es5/helpers/side-frame")

const OcMessageEditor = require("./oc-message-editor")
const OcMessage = require("../model/oc-message")

/* Definition */

class OcMessageSender extends View {
  constructor (params) {
    super(`
<div class="OcMessageSender">
  %ocMessageEditor

  <hr>

  <form class="Controls">
    <input type="button" value="Send" onclick=%send>
  </form>
    `)

    this.ocMessageEditor = new OcMessageEditor(params)
  }

  send () {
    const params = wrap(this.ocMessageEditor)
    if (params.destination && params.destination.length) {
      params.destination = params.destination && params.destination.split(/, */)
    } else {
      params.destination = null
    }

    const message = new OcMessage(params)
    const link = message.toCosmicLink()
    const frame = new SideFrame(link)

    return frame
  }
}

/* Export */
module.exports = OcMessageSender
