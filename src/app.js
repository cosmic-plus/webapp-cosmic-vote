"use strict"
/**
 * CosmicLink application.
 */
const Application = require("./lib/application")
const PollContract = require("./model/poll-contract")
const NetworkContext = require("./model/network-context")

require("./feat.poll.auto-update")

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
      "0582a51ba2d6f0dcdca5cffa4dc262787a834a9524c9b37e028987ab46bad3d7"
    this.network = "public"
    this.pollsInbox = "GCJSNTA62DOJ4GDMJRUCADFJEBQCRWD2VGRQXZG7KTXKYHTIZ3FJB5NJ"

    /* Imports */
    this.$pick(params, ["network", "txHash"])

    /* Poll */
    this.poll = new PollContract(this)
    this.poll.syncing = true
    PollContract.fromTxHash(this.txHash, this.network).then(async poll => {
      await poll.getVotes()
      this.poll = poll
    })

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
      title: "Browse",
      id: "browse",
      view: new CosmicVote.BrowseTab(this)
    })
    this.tabs.push({
      title: "New",
      id: "new",
      view: new CosmicVote.NewPollTab(this)
    })

    if (params.tab) this.selectedTabId = params.tab
    else if (!this.selectedTabId) this.selectedTabId = "vote"
  }
}

/* Computations */
const proto = CosmicVote.prototype

proto.$on("poll", function (currentPoll, previousPoll) {
  if (previousPoll) {
    previousPoll.stopVoteStream()
    this.$ignore(previousPoll)
  }
  this.$import(currentPoll, ["txHash", "syncing", "network", "title", "record"])
  if (currentPoll.txHash) currentPoll.streamVotes()
})

proto.$on("network", function () {
  if (typeof this.network === "string") {
    this.network = NetworkContext.normalize(this.network)
  }
})

/* Exports */
CosmicVote.BrowseTab = require("./app.browse")
CosmicVote.NewPollTab = require("./app.new-poll")
CosmicVote.ResultsTab = require("./app.results")
CosmicVote.VoteTab = require("./app.vote")
module.exports = CosmicVote
