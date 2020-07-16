"use strict"
/**
 * PollEditor.Candidate
 * */
const { View } = require("@kisbox/browser")

/* Definition */

class PollEditorCandidate extends View {
  constructor (params) {
    super(`
<div>
  <input type="text" value=%id maxlength="28">
  <button type="button" onclick=%delete>-</button>
</div>
    `)

    this.$import(params, ["id"])
  }

  /* Events */
  delete () {}
}

/* Export */
module.exports = PollEditorCandidate
