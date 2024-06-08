<script setup>
import * as bootstrap from 'bootstrap'
import { provide, reactive, ref } from 'vue'

import AchTable from '@/components/AchTable.vue'
import PageButton from '@/components/PageButton.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageFooter from '@/components/PageFooter.vue'
import SourceCheckModal from '@/components/SourceCheckModal.vue'

const responses = reactive({ get_claims: null, analyze: null })
const loading = reactive({ extractClaims: false, analyzeEvidence: false, generateReport: false })
const evidences = ref([])
const evidenceTunerCellRef = ref(null)

provide('responses', responses)
provide('evidenceTunerCellRef', evidenceTunerCellRef)

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

async function extractClaims() {
  // Add the loading spinner.
  loading.extractClaims = true

  // Get article text
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  // Fixes 'Receiving end does not exist' error on extension reload.
  await ensureContentScriptIsReady(tab.id)
  const articleText = (await chrome.tabs.sendMessage(tab.id, { action: 'getArticleText' })).text

  console.log(articleText)

  // Fetch page data from the API.
  try {
    const response = await fetch('http://178.79.182.88:8080/get_claims/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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

async function tableDrop() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Fixes 'Receiving end does not exist' error on extension reload.
  await ensureContentScriptIsReady(tab.id)
  const url = (await chrome.tabs.sendMessage(tab.id, { action: 'getFragmentUrl' })).url
  const text = (await chrome.tabs.sendMessage(tab.id, { action: 'getSelectionText' })).text

  evidences.value.push({ text, url })
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
        'Content-Type': 'application/json'
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
        'Content-Type': 'application/json'
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
</script>

<template>
  <div class="flex-column min-vh-100 d-flex">
    <PageHeader class="mt-2 mb-4 container-fluid" />

    <main class="container-fluid flex-grow-1">
      <div class="d-grid gap-2">
        <PageButton @click="extractClaims" :loading="loading.extractClaims"
          >Extract Claims</PageButton
        >
      </div>

      <div class="table-responsive my-3" v-if="responses.get_claims">
        <AchTable :responses="responses" :evidences="evidences" @drop="tableDrop"></AchTable>
      </div>

      <div v-if="evidences.length !== 0" class="d-grid gap-2">
        <PageButton @click="analyzeEvidence" :loading="loading.analyzeEvidence"
          >Analyse Evidence</PageButton
        >
      </div>

      <div v-if="responses.analyze" class="d-grid gap-2 mt-3">
        <PageButton @click="checkAndGenerateReport" :loading="loading.generateReport"
          >Generate Report</PageButton
        >
      </div>
    </main>

    <PageFooter />
  </div>
  <SourceCheckModal @continueAnyway="generateReport" />
</template>

<style scoped></style>
