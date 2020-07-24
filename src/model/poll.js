"use strict"
/**
 * Majority Judgment Poll
 */

const { LiveObject } = require("@kisbox/model")
const { call } = require("@kisbox/helpers")

const { sum } = require("@cosmic-plus/helpers")

const CrudArray = require("../lib/crud-array")

/* Defaults */
const grades = [
  "Dismissed",
  "Insufficient",
  "Undecided",
  "Passable",
  "Good",
  "Excellent"
]

/* Definition */

class Poll extends LiveObject {
  constructor (params) {
    super()

    this.type = "local"
    this.gradeShift = -2
    this.grades = grades
    this.members = []
    this.title = null
    this.results = []

    this.$import(params, ["members", "votes", "title"])
    if (!this.members) this.members = []
    if (!this.votes) this.votes = new CrudArray()
  }

  /**
   * mj.pushVote([0, 2, 1])
   */
  pushVote (vote) {
    const length = this.members.length

    if (vote.choice.length !== length) {
      throw new Error(`Invalid vote − should be an array of lengh ${length}`)
    }

    this.votes.put(vote)
  }

  computeResults () {
    call(Array).sort(this.votes, (a, b) => a.date - b.date)

    // List members
    const results = this.members.map(id => {
      return {
        id,
        counts: new Array(this.grades.length).fill(0)
      }
    })

    // Count votes
    this.votes.forEach(vote => {
      vote.choice.forEach((grade, index) => {
        const member = results[index]
        member.counts[grade]++
      })
    })

    // Compute results metrics
    results.forEach(member => {
      member.gauge = countsToGauge(member.counts)
      const metrics = gaugeMetrics(member.gauge)
      member.gradeIndex = metrics.median
      member.grade = this.grades[metrics.median]
      member.completion = metrics.completion
      member.ranking = metricsRanking(metrics)
    })

    // Sort by best rangking
    results.sort(byRanking)

    this.results = results
    return results
  }
}

/* Computations */
const proto = Poll.prototype

proto.$define("localBallots", ["localVoters", "votes"], function () {
  const localBallots = new CrudArray()

  this.votes.$forEach(ballot => {
    if (this.localVoters.includes(ballot.id)) {
      localBallots.put(ballot)
    }
  })
  localBallots.$listen(this.localVoters, "$add", voter => {
    this.votes.forEach(ballot => {
      if (ballot.id === voter) localBallots.put(ballot)
    })
  })

  return localBallots
})

/* Utilities */
function byRanking (x1, x2) {
  for (let i in x1.ranking) {
    const diff = x2.ranking[i] - x1.ranking[i]
    if (diff) return diff
  }
  return 0
}

function metricsRanking (metrics) {
  const ranking = []
  ranking.push(metrics.median)
  ranking.push(metrics.completion)

  while (metrics.gauge.length > 1) {
    const { median } = metrics
    const gauge = metrics.gauge.slice()

    if (median < gauge.length - 1) {
      gauge[median] += gauge[median + 1]
      gauge.splice(median + 1, 1)
    }
    if (median > 0) {
      gauge[median] += gauge[median - 1]
      gauge.splice(median - 1, 1)
    }

    metrics = gaugeMetrics(gauge)
    ranking.push(metrics.completion)
  }

  return ranking
}

function countsToGauge (counts) {
  const total = sum(counts)

  return counts.map(count => count / total)
}

function gaugeMetrics (gauge) {
  let count = 0,
    median
  for (let i = 0; i < gauge.length; i++) {
    median = i
    count += gauge[i]
    if (count >= 0.5) break
  }

  const under = count - gauge[median]
  const over = 1 - count
  const completion = (0.5 - under) / gauge[median]
  const ranking = [median, completion]

  return {
    gauge,
    median,
    completion,
    ranking,
    under,
    over
  }
}

/* Export */
module.exports = Poll
