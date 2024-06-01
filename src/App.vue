<script setup>
import { provide, reactive, ref } from 'vue'

import AchTable from '@/components/AchTable.vue'
import PageButton from '@/components/PageButton.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageFooter from '@/components/PageFooter.vue'

const responses = reactive({ get_claims: null, analyze: null })
const loading = reactive({ extractClaims: false, analyzeEvidence: false, generateReport: false })
const evidences = ref([])
const evidenceTunerCellRef = ref(null)

provide('responses', responses)
provide('evidenceTunerCellRef', evidenceTunerCellRef)

async function extractClaims() {
  // Add the loading spinner.
  loading.extractClaims = true

  // Get article text
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const articleText = (await chrome.tabs.sendMessage(tab.id, { action: 'getArticleText' })).text

  console.log(articleText)

  // Fetch page data from the API.
  responses.get_claims = await fetch('http://178.79.182.88:8080/get_claims/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: articleText
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((data) => {
      return data
    })
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error)
    })

  // Log the response to help with debugging.
  console.log('get_claims: ', responses.get_claims)

  // Remove the loading spinner.
  loading.extractClaims = false
}

async function tableDrop(event) {
  let data = event.dataTransfer.getData('text/plain')
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  const url = (await chrome.tabs.sendMessage(tab.id, { action: 'getFragmentUrl' })).url
  evidences.value.push({ text: data, url: url })
}

async function analyzeEvidence() {
  // Add the loading spinner.
  loading.analyzeEvidence = true

  // If the analyse evidence button is clicked while the evidence tuner is open the evidence tuner doesn't update to the new value.
  // This hides it until a new cell is clicked on, and it will be up to date again.
  evidenceTunerCellRef.value = null

  // Fetch page data from the API.
  responses.analyze = await fetch('http://178.79.182.88:8080/analyze/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      hypothesis: responses.get_claims.output.hypothesis,
      manual_evidences: evidences.value.map((t) => t.text),
      max_alignment_limit: -1,
      min_alignment_limit: -1,
      hypothesis_nodes: responses.get_claims.output.hypothesis_nodes,
      structure_hypothesis_graph: responses.get_claims.output.structure_hypothesis_graph
    })
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((data) => {
      return data
    })
    .catch((error) => {
      console.error('There has been a problem with your fetch operation:', error)
    })

  // Log the response to help with debugging.
  console.log('Analyze: ', responses.analyze.output)

  // Remove the loading spinner.
  loading.analyzeEvidence = false
}

async function generateReport() {
  // Add the loading spinner.
  loading.generateReport = true

  // Used for debugging the API response.
  let report

  // The other option here is: generate_per_claim_articles
  await fetch('http://178.79.182.88:8000/generate_check_result_article/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(responses.analyze.output)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .then((response) => {
      report = response
      response = response.output.article
      let textBlob = new Blob([response], { type: 'text/plain' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(textBlob)
      link.download = 'report' // Filename
      link.click()
      URL.revokeObjectURL(link.href)
    })
    .catch((error) => {
      console.error('Error downloading file:', error)
    })

  console.log('Report: ', report.output)

  // Remove the loading spinner.
  loading.generateReport = false
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
        <PageButton @click="generateReport" :loading="loading.generateReport"
          >Generate Report</PageButton
        >
      </div>
    </main>

    <PageFooter />
  </div>
</template>

<style scoped></style>
