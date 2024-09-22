// Don't compare the hash in the url to make sure we find any valid matches.
export function doUrlsMatch(urlA, urlB) {
  const parsedUrlA = new URL(urlA)
  const parsedUrlB = new URL(urlB)

  return (
    parsedUrlA.hostname === parsedUrlB.hostname &&
    parsedUrlA.port === parsedUrlB.port &&
    parsedUrlA.pathname === parsedUrlB.pathname &&
    parsedUrlA.search === parsedUrlB.search
  )
}

async function ensureContentScriptIsReady(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, {})
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    })
  }
}

export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Fixes 'Receiving end does not exist' error on extension reload.
  await ensureContentScriptIsReady(tab.id)

  return tab
}
