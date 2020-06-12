"use strict"
/**
 * Contract Viewer
 */
const { View } = require("@kisbox/browser")
const PassiveContract = require("../model/passive-contract")

/* Definition */

class ContractViewer extends View {
  static fromTxHash (hash, context) {
    const viewer = new ContractViewer()

    PassiveContract.fromTxHash(hash, context).then(contract => {
      for (let key in contract) viewer[key] = contract[key]
    })

    return viewer
  }

  constructor (params) {
    super(`
<form class="ContractViewer">
  
  <fieldset>
    <legend>Type</legend>
    <input type="text" value=%type readonly>
  </fieldset>

  <fieldset>
    <legend>State</legend>
    <input type="text" value=%state readonly>
  </fieldset>


  <fieldset>
    <legend>Params</legend>
    <textarea rows="5" value=%formattedContent readonly></textarea>
  </fieldset>

  <fieldset>
    <legend>Destination</legend>
    <input type="text" value=%destination readonly>
  </fieldset>

</form>

      `)

    this.$import(params, ["type", "destination", "params", "state"])
  }
}

/* Computations */
const proto = ContractViewer.prototype

proto.$define("formattedContent", ["params"], function () {
  return JSON.stringify(this.params, null, 2)
})

/* Export */
module.exports = ContractViewer
