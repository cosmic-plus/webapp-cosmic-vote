"use strict"
/**
 * Poll Editor
 */
const { View } = require("@kisbox/browser")
const { LiveArray } = require("@kisbox/model")

const { remove } = require("@cosmic-plus/helpers")

// const CrudArray = require("../lib/crud-array")

/* Definition */

class PollEditor extends View {
  constructor (params) {
    super(`
<form class="PollEditor">

  <fieldset>
    <legend $hint="The Stellar network where the poll is to be posted.">
      Network
    </legend>
    <input type="radio" $group="network" value="public" $label="Public">
    <input type="radio" $group="network" value="test" $label="Test">
  </fieldset>

  <fieldset>
    <legend $hint="A short, descriptive title for your poll.">
      Title
    </legend>
    <input type="text" value=%title maxlength="28"
       placeholder="Short Title (optional)">
  </fieldset>

  <fieldset>
    <legend $hint="Candidates' names, one entry minimum.">
      Candidates
    </legend>

    %toMemberInput:...members
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

</form>
    `)

    /* Defaults */
    this.members = new LiveArray()

    /* Imports */
    this.$import(params, ["members", "title", "destination"])
    this.$import(params, ["network"], x => x.id)
  }

  addMember (event) {
    if (event.keyCode && event.keyCode !== 13) return
    if (!this.newMember) return

    // Keep member id unique
    remove(this.members, this.newMember)

    this.members.push(this.newMember)
    this.newMember = null
  }
}

/* Helpers */
const helpers = PollEditor.helpers

helpers.toMemberInput = function (id) {
  const view = new PollEditorMember({ id })
  view.$on("delete", () => remove(this.members, id))
  view.$on("id", (current, previous) => {
    const index = this.members.indexOf(previous)
    this.members[index] = current
  })
  return view
}

class PollEditorMember extends View {
  constructor (params) {
    super(`
<div>
  <input type="text" value=%id maxlength="28">
  <button type="button" onclick=%delete>-</button>
</div>
    `)

    this.$import(params, ["id"])
  }

  delete () {}
}

/* Hint */
const { html } = require("@kisbox/browser")
View.attributes.hint = function (view, domNode, value) {
  const helpCircle = require("feather-icons/dist/icons/help-circle.svg")
  html.append(domNode, html.fromString(helpCircle))
  domNode.dataset.hint = value
}

/* Helpers */
html.fromString = function (string) {
  const tmp = html("div", { innerHTML: string })
  return tmp.childNodes[0]
}

/* Export */
module.exports = PollEditor
