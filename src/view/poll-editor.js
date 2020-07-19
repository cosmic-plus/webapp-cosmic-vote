"use strict"
/**
 * Poll Editor
 */
const { View } = require("@kisbox/browser")
const { LiveArray } = require("@kisbox/model")

const { remove } = require("@cosmic-plus/helpers")

/* Definition */

class PollEditor extends View {
  constructor (params) {
    super(`
<form class="PollEditor">

    <fieldset>
      <legend $hint="The Stellar network where the poll is to be posted.">
        Network
      </legend>
      <input type="radio" $group="network" value="public"
        $label="Stellar Public">
      <input type="radio" $group="network" value="test"
        $label="Stellar Test">
    </fieldset>

  <fieldset>
    <legend $hint="A short, descriptive title for your poll.">
      Title
    </legend>
    <input type="text" value=%title maxlength="28"
       placeholder="Short Title">
  </fieldset>

  <fieldset>
    <legend $hint="Candidates' names, one entry minimum.">
      Candidates
    </legend>

    %toCandidate:...members
    <input type="text" value=%newMember maxlength="28"
      onkeydown=%addMember
      placeholder="New Candidate">
    <button type="button" onclick=%addMember>+</button>

  </fieldset>

  <fieldset>
    <legend $hint="Whether your poll should be listed under the 'Browse' tab.">
      Listing
    </legend>

    <input type="radio" $group="destination" value="" checked
      $label="No Public Listing">
    <input type="radio" $group="destination" value="list*cosmic.vote"
      $label="List on Cosmic.vote">

  </fieldset>

  <nav>
    <a onclick=%switchAdvancedSettings>
      <span hidden=%showAdvancedSettings>⮞</span>
      <span hidden=%not:showAdvancedSettings>⮟</span>
      &nbsp;Advanced Settings
    </a>
  </nav>

  <div hidden=%not:showAdvancedSettings>
    <fieldset>
      <legend $hint="The date & time at which your poll will end. (optional)">
        Closing Time
      </legend>
      <div class="group">
        <input type="date" value=%closingDate>
        <input type="time" value=%closingTime>
      </div>
    </fieldset>
  </div>

</form>
    `)

    /* Defaults */
    this.members = new LiveArray()
    this.closingTime = "00:00"
    this.showAdvancedSettings = false

    /* Imports */
    this.$import(params, ["members", "title", "destination"])
    this.$import(params, ["network"], x => x.id)
  }

  switchAdvancedSettings () {
    this.showAdvancedSettings = !this.showAdvancedSettings
  }

  addMember (event = {}) {
    if (event.keyCode && event.keyCode !== 13) return
    if (!this.newMember) return

    // Keep member id unique
    remove(this.members, this.newMember)

    this.members.push(this.newMember)
    this.newMember = null
  }

  normalize () {
    if (this.newMember) {
      this.addMember()
    }
  }
}

/* Computations */
const proto = PollEditor.prototype

proto.$define("maxTime", ["closingDate", "closingTime"], function () {
  if (!this.closingDate || !this.closingTime) return

  const isoDate = `${this.closingDate}T${this.closingTime}`
  const timestamp = Number(new Date(isoDate))
  return timestamp
})

/* Helpers */
const helpers = PollEditor.helpers

helpers.toCandidate = function (id) {
  const view = new PollEditor.Candidate({ id })
  view.$on("delete", () => remove(this.members, id))
  view.$on("id", (current, previous) => {
    const index = this.members.indexOf(previous)
    this.members[index] = current
  })
  return view
}

/* Export */
PollEditor.Candidate = require("./poll-editor.candidate")
module.exports = PollEditor
