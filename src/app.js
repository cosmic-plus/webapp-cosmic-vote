"use strict"
/**
 * CosmicLink application.
 */
const Application = require("./lib/application")
const PollContract = require("./model/poll-contract")
const NetworkContext = require("./model/network-context")
const Parameters = require("./lib/parameters")
const { ballot } = require("./model/poll")

/* Constants */

const app = {}

app.logo = "合 "
app.name = "Cosmic.vote"

app.icons = [
  {
    title: "by Cosmic.plus",
    href: "https://cosmic.plus",
    file: require("@cosmic-plus/assets/svg/cosmic-plus.svg")
  },
  {
    title: "Follow on Reddit",
    href: "https://reddit.com/r/cosmic_plus",
    file: require("@fortawesome/fontawesome-free/svgs/brands/reddit.svg")
  },
  {
    title: "Follow on Medium",
    href: "https://medium.com/cosmic-plus",
    file: require("@fortawesome/fontawesome-free/svgs/brands/medium.svg")
  },
  {
    title: "Follow on Twitter",
    href: "https://twitter.com/cosmic_plus",
    file: require("@fortawesome/fontawesome-free/svgs/brands/twitter.svg")
  },
  {
    title: "Chat on Telegram",
    href: "https://t.me/cosmic_plus",
    file: require("@fortawesome/fontawesome-free/svgs/brands/telegram-plane.svg")
  },
  {
    title: "Chat on Keybase",
    href: "https://keybase.io/team/cosmic_plus",
    file: require("@fortawesome/fontawesome-free/svgs/brands/keybase.svg")
  },
  {
    title: "GitHub Repository",
    href: "https://git.cosmic.plus/webapp-cosmic-vote",
    file: require("@fortawesome/fontawesome-free/svgs/brands/github.svg")
  },
  {
    title: "Contact by Email",
    href: "mailto:mister.ticot@cosmic.plus",
    file: require("@fortawesome/fontawesome-free/svgs/solid/envelope.svg")
  }
]

/* Definition */

class CosmicVote extends Application {
  constructor (params) {
    super(app)

    /* Defaults */
    this.txHash =
      "4863f317de223e1cc7b84c82e9cc93a92a6c0f5db462a63be8bdb1fdfb442909"
    this.network = "test"

    /* Imports */
    this.$pick(params, ["network", "txHash"])
    if (this.txHash) {
      this.poll = PollContract.fromTxHash(this.txHash, this.network)
    } else {
      this.poll = ballot
    }

    // Development
    this.tabs.push({
      title: "Vote",
      id: "vote",
      view: new CosmicVote.VoteTab(this)
    })
    this.tabs.push({
      title: "Results",
      id: "results",
      view: new CosmicVote.ResultsTab(this)
    })
    this.tabs.push({
      title: "New Poll",
      id: "new",
      view: new CosmicVote.NewPollTab(this)
    })

    if (params.tab) this.selectedTabId = params.tab
    else if (!this.selectedTabId) this.selectedTabId = "vote"
  }
}

/* Computations */
const proto = CosmicVote.prototype

proto.$on("poll", function (current, previous) {
  if (previous) this.$ignore(previous)
  this.$import(current, ["txHash", "synced", "network", "title"])
})

proto.$on("network", function () {
  if (typeof this.network === "string") {
    this.network = NetworkContext.normalize(this.network)
  }
})

proto.$define("query", ["selectedTabId", "txHash", "network"], function () {
  const network = NetworkContext.normalize(this.network)
  return Parameters.toQuery({
    tab: this.selectedTabId,
    txHash: this.txHash,
    network: network.id === "public" ? null : network.id
  })
})

/* Exports */
CosmicVote.NewPollTab = require("./app.new-poll")
CosmicVote.ResultsTab = require("./app.results")
CosmicVote.VoteTab = require("./app.vote")
module.exports = CosmicVote
