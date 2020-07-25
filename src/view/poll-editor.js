"use strict"
/**
 * Poll Editor
 */
const { View } = require("@kisbox/browser")
const { LiveArray } = require("@kisbox/model")

const { remove } = require("@cosmic-plus/helpers")

const chevronRightSvg = require("feather-icons/dist/icons/chevron-right.svg")
const chevronDownSvg = require("feather-icons/dist/icons/chevron-down.svg")

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
    <a onclick=%switchVotersFiltering data-switcher=%showVotersFiltering>
      <span hidden=%showVotersFiltering>${chevronRightSvg}</span>
      <span hidden=%not:showVotersFiltering>${chevronDownSvg}</span>
      Voters Filtering
    </a>
    <a onclick=%switchAdvancedSettings data-switcher=%showAdvancedSettings>
      <span hidden=%showAdvancedSettings>${chevronRightSvg}</span>
      <span hidden=%not:showAdvancedSettings>${chevronDownSvg}</span>
      Advanced Settings
    </a>
  </nav>

  <div hidden=%not:showVotersFiltering>
    <fieldset>
      <legend $hint="Set how much of an asset voters have to hold at vote creation time, for their vote to count. Set the amount to 0 to filter by trustline. (Optional)">
        Hold Asset
      </legend>
      <div class="group">
        <input type="number" value=%hodlAmount step="0.0000001" min="0"
          placeHolder="Asset amount">
        <input type="text" value=%hodlAsset
          placeHolder="Asset ID (code:issuer)">
      </div>
    </fieldset>
    <fieldset>
      <legend $hint="Set a date from which the 'Hold Asset' requirement has to be valid. (Optional)">
        Hold Since
      </legend>
      <div class="group">
        <input type="date" value=%hodlDate>
        <input type="time" value=%hodlTime>
      </div>
    </fieldset>
  </div>

  <div hidden=%not:showAdvancedSettings>
    <fieldset>
      <legend $hint="The local date & time at which your poll will end.
        (optional)">
          Closing Time
      </legend>
      <div class="group">
        <input type="date" value=%closingDate>
        <input type="time" value=%closingTime>
      </div>
    </fieldset>

    <fieldset>
      <legend $hint="Allow users to edit their vote while the poll is still open.">
        Vote Editing
      </legend>
      <input type="radio" $group="noEdit" value=""
        $label="Allow Edits">
      <input type="radio" $group="noEdit" value="true"
       $label="Forbid Edits">
    </fieldset>

  </div>


</form>
    `)

    /* Defaults */
    this.members = new LiveArray()
    this.closingTime = "00:00"
    this.showVotersFiltering = false
    this.voterHodl = null
    this.hodlAsset = "native"
    this.hodlAmount = 0
    this.hodlDate = null
    this.hodlTime = "00:00"
    this.showAdvancedSettings = false
    this.noEdit = ""

    /* Imports */
    this.$import(params, ["members", "title", "destination"])
    this.$import(params, ["network"], x => x.id)
  }

  switchVotersFiltering () {
    this.showAdvancedSettings = false
    this.showVotersFiltering = !this.showVotersFiltering
  }

  switchAdvancedSettings () {
    this.showVotersFiltering = false
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

proto.$define(
  "voterHodl",
  ["hodlAsset", "hodlAmount", "hodlSince"],
  function () {
    if (
      (!this.hodlAsset || this.hodlAsset === "native")
      && !this.hodlAmount
      && !this.hodlSince
    ) {
      return null
    } else {
      return {
        assetId: this.hodlAsset,
        amount: this.hodlAmount,
        since: this.hodlSince
      }
    }
  }
)

proto.$define("hodlSince", ["hodlDate", "hodlTime"], function () {
  if (!this.hodlDate || !this.hodlTime) return null

  const isoDate = `${this.hodlDate}T${this.hodlTime}`
  const timestamp = Number(new Date(isoDate))
  return timestamp
})

proto.$on("hodlAmount", function () {
  this.hodlAmount = Number(this.hodlAmount)
    .toFixed(7)
    .replace(/\.?0+$/, "")
})

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
