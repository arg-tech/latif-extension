import * as bootstrap from 'bootstrap'
import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { ensureContentScriptIsReady } from './utils'

export const useStore = defineStore('store', () => {
  const responses = reactive({ get_claims: null, analyze: null })
  const loading = reactive({ analyzeEvidence: false, generateReport: false })
  const evidences = ref([])
  const evidenceTunerCellRef = ref(null)
  const extractedClaimsUrl = ref(null)

  async function extractClaims() {
    // Get article text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    // Fixes 'Receiving end does not exist' error on extension reload.
    await ensureContentScriptIsReady(tab.id)
    const articleText = (await chrome.tabs.sendMessage(tab.id, { action: 'getArticleText' })).text

    console.log(articleText)

    extractedClaimsUrl.value = tab.url

    // Fetch page data from the API.
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

  async function checkAndGenerateReport() {
    // Check number of unique URLs is acceptable.
    let uniqueUrls = new Set()
    for (const e of evidences.value) {
      const url = new URL(e.url)
      url.hash = ''
      uniqueUrls.add(url.toString())
    }

    if (uniqueUrls.size <= 2) {
      const myModal = new bootstrap.Modal('#sourceCheckModal', {})
      myModal.show()

      return
    }

    generateReport()
  }

  async function generateReport() {
    // Add the loading spinner.
    loading.generateReport = true

    try {
      // The other option here is: generate_per_claim_articles
      const response = await fetch('http://178.79.182.88:8000/generate_check_result_article/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify(responses.analyze.output)
      })

      if (!response.ok) {
        return
      }

      const article = (await response.json()).output.article

      let textBlob = new Blob([article], { type: 'text/plain' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(textBlob)
      link.download = 'report' // Filename
      link.click()
      URL.revokeObjectURL(link.href)

      console.log('Report: ', response.output)
    } finally {
      // Remove the loading spinner.
      loading.generateReport = false
    }
  }

  return {
    responses,
    loading,
    evidences,
    evidenceTunerCellRef,
    extractedClaimsUrl,
    extractClaims,
    analyzeEvidence,
    checkAndGenerateReport,
    generateReport
  }
})
