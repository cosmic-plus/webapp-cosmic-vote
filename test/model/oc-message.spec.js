/* eslint-env jasmine */
"use strict"

const StellarSdk = require("stellar-sdk")
const cosmicLib = require("cosmic-lib")

const TxParams = require("@cosmic-plus/tx-params")
const { friendbot } = require("@cosmic-plus/base")

const OcMessage = require("../../src/model/oc-message")

const { any } = jasmine

/* Setup */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000
jasmine.currentEnv_.configure({ random: false })

const conf = { network: "test" }

/* Data */

const network = "test"
const sender = StellarSdk.Keypair.random()
const destination = StellarSdk.Keypair.random().publicKey()

const object = "Les enfants qui s'aiment"
const poem = `Les enfants qui s'aiment s'embrassent debout
Contre les portes de la nuit
Et les passants qui passent les désignent du doigt
Mais les enfants qui s'aiment
Ne sont là pour personne`

const mail = new OcMessage({ network, object, destination: [], content: poem })
const mailJson = `{
  "network": "test",
  "memo": {
    "type": "text",
    "value": "Les enfants qui s'aiment"
  },
  "operations": [
    {
      "type": "manageData",
      "name": "POST",
      "value": {
        "type": "base64",
        "value": "TGVzIGVuZmFudHMgcXVpIHMnYWltZW50IHMnZW1icmFzc2VudCBkZWJvdXQKQ29udHJlIGxlcyBwb3J0ZXMgZA"
      }
    },
    {
      "type": "manageData",
      "name": "POST",
      "value": {
        "type": "base64",
        "value": "ZSBsYSBudWl0CkV0IGxlcyBwYXNzYW50cyBxdWkgcGFzc2VudCBsZXMgZMOpc2lnbmVudCBkdSBkb2lndApNYQ"
      }
    },
    {
      "type": "manageData",
      "name": "POST",
      "value": {
        "type": "base64",
        "value": "aXMgbGVzIGVuZmFudHMgcXVpIHMnYWltZW50Ck5lIHNvbnQgbMOgIHBvdXIgcGVyc29ubmU"
      }
    },
    {
      "type": "manageData",
      "name": "POST",
      "value": {
        "type": "text",
        "value": ""
      }
    }
  ]
}` 

/* Specifications */

describe("OcMessage", () => {
  // beforeAll(async () => {
  //   await friendbot(sender.publicKey())
  //   await friendbot(destination)
  // })

  it("converts to TxParams", () => {
    const txParams = mail.toTxParams()
    expect(txParams).toEqual(any(TxParams))
    expect(txParams.to("json")).toEqual(mailJson)
  })

  it("converts from TxParams", () => {
    const txParams = TxParams.from("json", mailJson)
    const convertedMail = OcMessage.fromTxParams(txParams)
    expect(convertedMail).toEqual(mail)
  })

  it("has no parameters", () => {
    // const mail = new OcMessage()
    // const txParams = mail.toTxParams()
    // expect(txParams.to("json")).toEqual(new TxParams().to("json"))
  })

  it("hash no destination", () => {})
  it("only has a destination", () => {})
  it("only has several destinations", () => {})
})

// describe("messenger", () => {
//   it("sends data over Stellar", async () => {
//   })

//   it("lists received messages", async () => {
//   })

//   it("retrieves message content", async () => {
//   })
// })
