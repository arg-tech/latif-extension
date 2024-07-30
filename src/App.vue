<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'

const store = useStore()

import AchTable from '@/components/AchTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import BaseModal from '@/components/BaseModal.vue'
import { doUrlsMatch, ensureContentScriptIsReady } from '@/utils'
import { reactive } from 'vue'

const modal = ref(null)

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

function sourceCheckModalConfirm() {
  store.draftReport()
  modal.value.hide()
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

          <Teleport v-if="store.showSourceCheckModal" to="body">
            <BaseModal
              ref="modal"
              v-on="{ 'hidden.bs.modal': () => (store.showSourceCheckModal = false) }"
              @confirm="sourceCheckModalConfirm"
              title="Warning: Insufficient Evidence and Source Variety"
              confirmButtonText="Continue anyway"
            >
              You are trying to generate a report which doesn't have either enough evidences, or all
              of your evidences are from the same source. Try doing:
              <ul>
                <li>Add more than two evidences in the table.</li>
                <li>Add more evidence from different sources (webpages).</li>
              </ul>
            </BaseModal>
          </Teleport>
        </BaseButton>
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped></style>
