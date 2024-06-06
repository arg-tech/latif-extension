import { Readability } from '@mozilla/readability'
import { convert } from 'html-to-text'
import { generateFragment } from 'text-fragments-polyfill/dist/fragment-generation-utils.js'

function getArticleText() {
  const article = new Readability(document.cloneNode(true), { charThreshold: 100 }).parse()
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
  } else if (message.action === 'getFragmentUrl') {
    sendResponse({ url: getFragmentUrl() })
  } else if (message.action === 'getSelectionText') {
    sendResponse({ text: getSelectionText() })
  } else if (message.action === 'goToUrl') {
    goToUrl(message.url)
  }
})
