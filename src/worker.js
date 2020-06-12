"use strict"

const ServiceWorker = require("@kisbox/service-worker")
const pkg = require("../package.json")

new ServiceWorker(pkg.name, pkg.version, "verbose")
  .fromCache([
    // Application
    "index.css",
    "index.html",
    "index.js",
    "stellar-sdk.js",

    // Fonts
    "fonts/source-sans-pro.woff",
    "fonts/source-sans-pro.woff2",
    "fonts/roboto-slab.woff",
    "fonts/roboto-slab.woff2",

    // Vendor configuration
    "browserconfig.xml",
    "manifest.json"
  ])
  .precache()
  .register()
