/**
 * HTML helpers
 * */
const my = exports

const { nice } = require("@cosmic-plus/utils")
const { html } = require("@kisbox/browser")

/* Library */

my.stringToHtml = function (string) {
  const tmp = html("div", { innerHTML: string })
  return tmp.childNodes[0]
}

my.gaugeMeter = function ({ gauge, names, colors = my.gaugeMeter.colors }) {
  const spans = gauge.map((ratio, index) => {
    const width = `${nice(ratio * 100)}%`
    const background = colors[index]
    const textContent = names ? names[index] : width
    return my.colorSpan({ width, background, textContent })
  })
  return html("div", { className: "Gauge" }, spans)
}
my.gaugeMeter.colors = [
  "#EC5F67",
  "#FAC863",
  "#D8DEE9",
  "#99C794",
  "#5FB3B3",
  "#6699CC"
]

my.colorSpan = function ({ width, background, textContent }) {
  if (width === "0%") return

  const node = html("span", { textContent })
  Object.assign(node.style, {
    display: "inline-block",
    width,
    background
  })
  return node
}
