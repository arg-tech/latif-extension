import { Readability } from '@mozilla/readability'
import { convert } from 'html-to-text'
import { generateFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils.js'

let articleHeading = ''
let articleSubheading = ''

function getArticleText() {
  const article = new Readability(document.cloneNode(true), { charThreshold: 100 }).parse()

  // Save processing entire page multiple times.
  articleHeading = article.title
  articleSubheading = article.excerpt

  return {
    text: convert(article.content, {
      selectors: [
        // Remove links from showing up in mined webpage.
        { selector: 'img', format: 'skip' },
        { selector: 'a', format: 'anchor', options: { ignoreHref: 'true' } }
      ]
    })
  }
}

// Function to search for the sentence and create a range
function createRangeForSentence(sentence) {
  let walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)
  let node
  let range = document.createRange()

  while ((node = walker.nextNode())) {
    let nodeText = node.nodeValue
    let startIndex = nodeText.indexOf(sentence)
    if (startIndex !== -1) {
      range.setStart(node, startIndex)
      range.setEnd(node, startIndex + sentence.length)
      console.log('Range created for the sentence:', range)
      return range
    }
  }
  console.log('Sentence not found.')
  return null
}

// Function to search for the sentence and create a range
function newcreateRangeForSentence(sentence) {
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)
  var node
  var range = document.createRange()
  var startNode = null
  var startIndex = -1
  var endNode = null
  var endIndex = -1
  var found = false
  var nodeTextAccumulated = ''
  var accumulatedIndex = -1

  while ((node = walker.nextNode())) {
    var nodeText = node.nodeValue
    nodeTextAccumulated += nodeText

    // Check if the accumulated text contains the sentence
    accumulatedIndex = nodeTextAccumulated.indexOf(sentence)

    if (accumulatedIndex !== -1) {
      break
    }
  }

  if (accumulatedIndex === -1) {
    console.log('Sentence not found.')
    return null
  }

  // Calculate the start and end nodes and indices
  var remainingLength = sentence.length
  var currentIndex = 0

  walker.currentNode = document.body // Reset walker to the start

  while ((node = walker.nextNode())) {
    var nodeText = node.nodeValue
    var nodeTextLength = nodeText.length

    if (startNode === null && accumulatedIndex < currentIndex + nodeTextLength) {
      startNode = node
      startIndex = accumulatedIndex - currentIndex
    }

    if (startNode !== null && remainingLength <= nodeTextLength) {
      endNode = node
      endIndex = remainingLength
      found = true
      break
    }

    if (startNode !== null) {
      remainingLength -= nodeTextLength
    }

    currentIndex += nodeTextLength
  }

  if (found && startNode && endNode) {
    range.setStart(startNode, startIndex)
    range.setEnd(endNode, endIndex)
    console.log('Range created for the sentence:', range)
    return range
  }

  console.log('Sentence not found.')
  return null
}

function highlightHypotheses(hypotheses) {
  let ranges = []
  for (const hypothesis of hypotheses) {
    const nh = hypothesis.replace(/(\r\n|\n|\r)+/gm, ' ')
    console.log('looking for text: ', nh)
    const range = createRangeForSentence(nh)

    if (!range) continue
    ranges.push(range)
  }
  const highlight = new Highlight(...ranges)
  CSS.highlights.set('hypotheses', highlight)
}

function getFragmentUrl() {
  const result = generateFragment(window.getSelection())
  if (result.status === 0) {
    let url = `${location.origin}${location.pathname}${location.search}`
    const fragment = result.fragment
    const prefix = fragment.prefix ? `${encodeURIComponent(fragment.prefix)}-,` : ''
    const suffix = fragment.suffix ? `,-${encodeURIComponent(fragment.suffix)}` : ''
    const start = encodeURIComponent(fragment.textStart)
    const end = fragment.textEnd ? `,${encodeURIComponent(fragment.textEnd)}` : ''
    url += `#:~:text=${prefix}${start}${end}${suffix}`
    return url
  }
}

function getHeading() {
  return articleHeading
}

function getSubheading() {
  return articleSubheading
}

function getSelectionText() {
  return window.getSelection().toString()
}

function goToUrl(url) {
  const link = document.createElement('a')
  link.href = url
  link.click()
  URL.revokeObjectURL(link.href)
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getArticleText') {
    sendResponse(getArticleText())
  } else if (message.action === 'highlightHypotheses') {
    highlightHypotheses(message.hypotheses)
  } else if (message.action === 'getFragmentUrl') {
    sendResponse({ url: getFragmentUrl() })
  } else if (message.action === 'getHeading') {
    sendResponse({ text: getHeading() })
  } else if (message.action === 'getSubheading') {
    sendResponse({ text: getSubheading() })
  } else if (message.action === 'getSelectionText') {
    sendResponse({ text: getSelectionText() })
  } else if (message.action === 'goToUrl') {
    goToUrl(message.url)
  }
})
