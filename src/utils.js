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
