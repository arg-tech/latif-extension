import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { ensureContentScriptIsReady } from './utils'

export const useStore = defineStore('store', () => {
  const responses = reactive({ get_claims: null, analyze: null })
  const loading = reactive({ extractClaims: false, analyzeEvidence: false, generateReport: false })
  const evidences = ref([])
  const evidenceTunerCellRef = ref(null)
  const extractedClaimsUrl = ref(null)

  async function extractClaims() {
    // Add the loading spinner.
    loading.extractClaims = true

    // Get article text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    // Fixes 'Receiving end does not exist' error on extension reload.
    await ensureContentScriptIsReady(tab.id)
    const articleText = (await chrome.tabs.sendMessage(tab.id, { action: 'getArticleText' })).text

    console.log(articleText)

    extractedClaimsUrl.value = tab.url

    // Fetch page data from the API.
    try {
      const response = await fetch('http://178.79.182.88:8080/get_claims/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({
          text: articleText
        })
      })

      if (!response.ok) {
        return
      }

      responses.get_claims = await response.json()

      // Log the response to help with debugging.
      console.log('get_claims: ', responses.get_claims)
    } finally {
      // Remove the loading spinner.
      loading.extractClaims = false
    }
  }

  async function analyzeEvidence() {
    // Add the loading spinner.
    loading.analyzeEvidence = true

    // If the analyse evidence button is clicked while the evidence tuner is open the evidence tuner doesn't update to the new value.
    // This hides it until a new cell is clicked on, and it will be up to date again.
    evidenceTunerCellRef.value = null

    try {
      // Fetch page data from the API.
      const response = await fetch('http://178.79.182.88:8080/analyze/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify({
          ...responses.get_claims.output,
          manual_evidences: evidences.value.map((t) => t.text),
          max_alignment_limit: -1,
          min_alignment_limit: -1
        })
      })

      if (!response.ok) {
        return
      }

      responses.analyze = await response.json()

      // Log the response to help with debugging.
      console.log('Analyze: ', responses.analyze.output)
    } finally {
      // Remove the loading spinner.
      loading.analyzeEvidence = false
    }
  }

  return {
    responses,
    loading,
    evidences,
    evidenceTunerCellRef,
    extractedClaimsUrl,
    extractClaims,
    analyzeEvidence
  }
})
