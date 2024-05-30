<script setup>
import { reactive, ref } from 'vue'

import AchTable from '@/components/AchTable.vue'
import EvidenceTuner from '@/components/EvidenceTuner.vue'
import PageButton from '@/components/PageButton.vue'
import PageHeader from '@/components/PageHeader.vue'
import PageFooter from '@/components/PageFooter.vue'

const responses = reactive({ get_claims: null, analyze: null })
const loading = reactive({ extractClaims: false, analyzeEvidence: false, generateReport: false })
const evidences = ref([])
const sliderIndex = ref(null)

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

function tableDrop(event) {
  let data = event.dataTransfer.getData('text/plain')
  evidences.value.push(data)
}

async function analyzeEvidence() {
  // Add the loading spinner.
  loading.analyzeEvidence = true

  // Fetch page data from the API.
  responses.analyze = await fetch('http://178.79.182.88:8080/analyze/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      hypothesis: responses.get_claims.output.hypothesis,
      manual_evidences: evidences.value,
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
  this.loading.generateReport = true

  // Used for debugging the API response.
  let report

  // The other option here is: generate_per_claim_articles
  await fetch('http://178.79.182.88:8000/generate_check_result_article/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(this.responses.analyze.output)
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
  this.loading.generateReport = false
}
</script>

<template>
  <main class="container-fluid mt-2 flex-grow-1">
    <PageHeader class="mb-4" />

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

    <div v-if="sliderIndex" class="mt-3">
      <EvidenceTuner
        v-model="responses.analyze.output.full_scoring_matrix[sliderIndex[1]][sliderIndex[0]]"
      />
    </div>
  </main>

  <PageFooter />
</template>

<style scoped></style>
