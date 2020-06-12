"use strict"
/**
 * DebugPage
 */
const { View } = require("@kisbox/browser")

/* Definition */

class DebugPage extends View {
  constructor () {
    super(`
<section class="Widget">
  <h2>Debug Page</h2>
  <hr>
  
  %view

</section>
    `)

    this.view = "Hello, World"
  }
}

/* Export */
module.exports = DebugPage
