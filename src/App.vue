<script setup>
import { useStore } from '@/store'

const store = useStore()

import AchTable from '@/components/AchTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import SourceCheckModal from '@/components/SourceCheckModal.vue'
import { doUrlsMatch, ensureContentScriptIsReady } from '@/utils'
import { reactive } from 'vue'

async function tableDrop() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Fixes 'Receiving end does not exist' error on extension reload.
  await ensureContentScriptIsReady(tab.id)
  const url = (await chrome.tabs.sendMessage(tab.id, { action: 'getFragmentUrl' })).url
  const text = (await chrome.tabs.sendMessage(tab.id, { action: 'getSelectionText' })).text

  if (doUrlsMatch(tab.url, store.selectThisNewsArticleUrl)) {
    store.responses.get_claims.output.hypothesis.push(text)
  } else {
    store.evidences.push({ text, url })
  }
}

const loading = reactive({ selectThisNewsArticle: false, analyzeEvidence: false })

async function selectThisNewsArticle() {
  loading.selectThisNewsArticle = true
  try {
    await store.selectThisNewsArticle()
  } finally {
    loading.selectThisNewsArticle = false
  }
}

async function analyzeEvidence() {
  loading.analyzeEvidence = true
  try {
    await store.analyzeEvidence()
  } finally {
    loading.analyzeEvidence = false
  }
}
</script>

<template>
  <div class="flex-column min-vh-100 d-flex">
    <BaseHeader class="mt-2 mb-4 container-fluid" />

    <main class="container-fluid flex-grow-1">
      <div class="d-grid gap-2">
        <BaseButton @click="selectThisNewsArticle" :loading="loading.selectThisNewsArticle">
          Select This News Article
        </BaseButton>
      </div>

      <div class="table-responsive my-3" v-if="store.responses.get_claims">
        <AchTable @drop="tableDrop"></AchTable>
      </div>

      <div v-if="store.evidences.length !== 0" class="d-grid gap-2">
        <BaseButton @click="analyzeEvidence" :loading="loading.analyzeEvidence">
          Analyse Evidence
        </BaseButton>
      </div>

      <div v-if="store.responses.analyze" class="d-grid gap-2 mt-3">
        <BaseButton @click="store.checkAndDraftReport" :loading="store.loading.draftReport">
          Draft Report
        </BaseButton>
      </div>
    </main>

    <BaseFooter />
  </div>
  <SourceCheckModal @continueAnyway="store.draftReport" />
</template>

<style scoped></style>
