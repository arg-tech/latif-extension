<script setup>
import * as bootstrap from 'bootstrap'
import { provide } from 'vue'
import { useStore } from '@/store'
import { storeToRefs } from 'pinia'

const store = useStore()

import AchTable from '@/components/AchTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import SourceCheckModal from '@/components/SourceCheckModal.vue'
import { doUrlsMatch, ensureContentScriptIsReady } from '@/utils'

const responses = store.responses
const loading = store.loading
const { evidences } = storeToRefs(store)
const { evidenceTunerCellRef } = storeToRefs(store)

provide('responses', responses)
provide('evidenceTunerCellRef', evidenceTunerCellRef)

async function tableDrop() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Fixes 'Receiving end does not exist' error on extension reload.
  await ensureContentScriptIsReady(tab.id)
  const url = (await chrome.tabs.sendMessage(tab.id, { action: 'getFragmentUrl' })).url
  const text = (await chrome.tabs.sendMessage(tab.id, { action: 'getSelectionText' })).text

  if (doUrlsMatch(tab.url, store.extractedClaimsUrl)) {
    responses.get_claims.output.hypothesis.push(text)
  } else {
    evidences.value.push({ text, url })
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
</script>

<template>
  <div class="flex-column min-vh-100 d-flex">
    <BaseHeader class="mt-2 mb-4 container-fluid" />

    <main class="container-fluid flex-grow-1">
      <div class="d-grid gap-2">
        <BaseButton @click="store.extractClaims" :loading="loading.extractClaims"
          >Extract Claims</BaseButton
        >
      </div>

      <div class="table-responsive my-3" v-if="responses.get_claims">
        <AchTable :responses="responses" :evidences="evidences" @drop="tableDrop"></AchTable>
      </div>

      <div v-if="evidences.length !== 0" class="d-grid gap-2">
        <BaseButton @click="store.analyzeEvidence" :loading="loading.analyzeEvidence"
          >Analyse Evidence</BaseButton
        >
      </div>

      <div v-if="responses.analyze" class="d-grid gap-2 mt-3">
        <BaseButton @click="checkAndGenerateReport" :loading="loading.generateReport"
          >Generate Report</BaseButton
        >
      </div>
    </main>

    <BaseFooter />
  </div>
  <SourceCheckModal @continueAnyway="generateReport" />
</template>

<style scoped></style>
