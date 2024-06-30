<script setup>
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
        <BaseButton @click="store.checkAndGenerateReport" :loading="loading.generateReport"
          >Generate Report</BaseButton
        >
      </div>
    </main>

    <BaseFooter />
  </div>
  <SourceCheckModal @continueAnyway="store.generateReport" />
</template>

<style scoped></style>
