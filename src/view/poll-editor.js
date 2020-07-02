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

  <fieldset hidden><legend>Network</legend>
    <input type="radio" $group="network" value="public" $label="Public">
    <input type="radio" $group="network" value="test" $label="Test">
  </fieldset>

  <fieldset>
    <legend $hint="A short, descriptive title used in vote listing">
      Title
    </legend>
    <input type="text" placeholder="Short Title (optional)" value=%title>
  </fieldset>

  <fieldset>
    <legend $hint="One member minimum">
      Members
    </legend>

    %toMemberInput:...members
    <input type="text" placeholder="New Candidate"
      onkeydown=%addMember value=%newMember>
    <button type="button" onclick=%addMember>+</button>

  </fieldset>

  <fieldset>
    <legend $hint="The address where to list your poll">Listing</legend>

    <input type="text" name="stellar-polls-register" value=%destination
      placeholder="Public Key or Federated Address (optional)">
  </fieldset>

</form>
    `)

    /* Defaults */
    this.members = new LiveArray()
    this.destination = "list*cosmic.vote"

    /* Imports */
    this.$import(params, ["members", "title", "destination"])
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
  <input type="text" value=%id>
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
