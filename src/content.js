import { Readability } from '@mozilla/readability'
import { convert } from 'html-to-text'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getArticleText') {
    const article = new Readability(document.cloneNode(true), { charThreshold: 200 }).parse()
    sendResponse({ text: convert(article.content) })
  }
})
