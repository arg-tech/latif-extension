<script setup>
import { ref } from 'vue'
import { doUrlsMatch } from '@/utils'

defineProps({
  evidence: String,
  rowIndex: Number
})

const anchor = ref(null)

// Either opens a new tab or switches to an existing tab and modifies the url to include the text fragment.
async function onClick(evidenceUrl) {
  const tabs = await chrome.tabs.query({ currentWindow: true })

  // Find the nearest tab to the active one with the correct url.
  const activeTab = tabs.find((tab) => tab.active)
  let nearestTab = null
  let minDistance = Infinity
  for (const tab of tabs) {
    if (doUrlsMatch(tab.url, evidenceUrl)) {
      const distance = Math.abs(activeTab.index - tab.index)
      if (distance < minDistance) {
        minDistance = distance
        nearestTab = tab
      }
    }
  }

  // The user doesn't have the page the evidence came from open anymore.
  if (nearestTab === null) {
    window.open(evidenceUrl, '_blank', 'noreferrer')
    return
  }

  // If tab is open then go to it and add text fragment to url.
  await chrome.tabs.update(nearestTab.id, { active: true })
  chrome.tabs.sendMessage(nearestTab.id, { action: 'goToUrl', url: evidenceUrl })
}
</script>

<template>
  <td>
    <a
      :href="evidence.url"
      class="d-block text-decoration-none text-reset"
      @click.prevent="onClick(evidence.url)"
      ref="anchor"
      >{{ evidence.text }}</a
    >
  </td>
</template>
