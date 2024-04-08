import { Readability } from '@mozilla/readability'
import { convert } from 'html-to-text'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getArticleText') {
    const article = new Readability(document.cloneNode(true), { charThreshold: 100 }).parse()
    sendResponse({
      text: convert(article.content, {
        selectors: [
          // Remove links from showing up in mined webpage.
          { selector: 'img', format: 'skip' },
          { selector: 'a', format: 'anchor', options: { ignoreHref: 'true' } }
        ]
      })
    })
  }
})
