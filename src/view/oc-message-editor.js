"use strict"
/**
 * OcMessageEditor
 */
const { View } = require("@kisbox/browser")

/* Definition */

class OcMessageEditor extends View {
  constructor (params) {
    super(`
<form class="OcMessageEditor">

  <fieldset>
    <legend>Object</legend>
    <input type="text" placeholder="String (28 characters max.)" value=%object>
  </fieldset>

  <fieldset>
    <legend $hint="Multiple comma-separated destinations are accepted">
      Destination
    </legend>
    <input type="text" placeholder="Stellar Address (Pubkey or Federated)" value=%destination>
  </fieldset>

  <fieldset>
    <legend>Content</legend>
    <textarea rows="5" placeholder="4Ko Max" value=%content></textarea>
  </fieldset>

</form>
    `)

    this.network = "test"
    this.$import(params, ["object", "destination", "content", "network"])
  }
}

/* Export */
module.exports = OcMessageEditor
