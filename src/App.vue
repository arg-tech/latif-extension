<script setup>
import { reactive, ref } from 'vue'
import ExclamationTriangleFill from 'bootstrap-icons/bootstrap-icons.svg#exclamation-triangle-fill'
import AchTable from '@/components/AchTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import BaseModal from '@/components/BaseModal.vue'
import { useStore } from '@/store'
import { doUrlsMatch, ensureContentScriptIsReady } from '@/utils'
import HelpButton from '@/components/HelpButton.vue'

const store = useStore()
const modal = ref(null)
const showSourceCheckModal = ref(false)
const loading = reactive({
  selectThisNewsArticle: false,
  analyzeEvidence: false,
  draftReport: false
})
const fetchErrors = reactive({
  selectThisNewsArticle: null,
  analyzeEvidence: null,
  draftReport: null
})

async function tableDrop() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Fixes 'Receiving end does not exist' error on extension reload.
  await ensureContentScriptIsReady(tab.id)
  const url = (await chrome.tabs.sendMessage(tab.id, { action: 'getFragmentUrl' })).url
  const text = (await chrome.tabs.sendMessage(tab.id, { action: 'getSelectionText' })).text

  if (doUrlsMatch(tab.url, store.articleUrl)) {
    store.hypotheses.push(text)
    store.manualMatrix.push(Array.from({ length: store.evidences.length }, () => undefined))
  } else {
    store.evidences.push({ text, url })
    store.manualMatrix.map((x) => x.push(undefined))
  }
}

function selectThisNewsArticle() {
  const useFetchReturn = store.selectThisNewsArticle()
  loading.selectThisNewsArticle = useFetchReturn.isFetching
  fetchErrors.analyzeEvidence = useFetchReturn.error
}

function analyzeEvidence() {
  const useFetchReturn = store.analyzeEvidence()
  loading.analyzeEvidence = useFetchReturn.isFetching
  fetchErrors.analyzeEvidence = useFetchReturn.error
}

function draftReport() {
  function areDraftReportConditionsMet() {
    // Check number of unique URLs is acceptable.
    let uniqueUrls = new Set()
    for (const e of store.evidences) {
      const url = new URL(e.url)
      url.hash = ''
      uniqueUrls.add(url.toString())
    }

    if (uniqueUrls.size <= 2) {
      return false
    }

    return true
  }

  if (!areDraftReportConditionsMet()) {
    showSourceCheckModal.value = true
    return
  }

  const useFetchReturn = store.draftReport()
  loading.draftReport = useFetchReturn.isFetching
  fetchErrors.draftReport = useFetchReturn.error
}

function sourceCheckModalConfirm() {
  const useFetchReturn = store.draftReport()
  loading.draftReport = useFetchReturn.isFetching
  fetchErrors.draftReport = useFetchReturn.error
  modal.value.hide()
}
</script>

<template>
  <div class="flex-column min-vh-100 d-flex">
    <BaseHeader class="mt-2 mb-4 container-fluid" />

    <div
      v-if="fetchErrors.selectThisNewsArticle !== null"
      class="mt-3 d-flex align-items-center alert alert-danger"
      role="alert"
    >
      <svg class="bi flex-shrink-0 me-2" width="16" height="16" fill="currentColor">
        <use :xlink:href="ExclamationTriangleFill" />
      </svg>
      Select This News Article failed: {{ fetchErrors.selectThisNewsArticle }}
    </div>

    <main class="container-fluid flex-grow-1">
      <div class="d-flex gap-2">
        <BaseButton
          @click="selectThisNewsArticle"
          :loading="loading.selectThisNewsArticle"
          class="flex-grow-1"
        >
          Select This News Article
        </BaseButton>
        <HelpButton help-text="Automatically identifies the claims made in this article." />
      </div>

      <div class="d-flex my-3 gap-2" v-if="store.hypotheses.length !== 0">
        <div class="table-responsive">
          <AchTable @drop="tableDrop"></AchTable>
        </div>
        <HelpButton
          help-text="Drag and drop supporting and opposing evidence from other sources into the table for evaluation. Tip: Make sure to drop the evidence directly onto the table to get it to add."
        />
      </div>

      <div
        v-if="fetchErrors.analyzeEvidence !== null"
        class="mt-3 d-flex align-items-center alert alert-danger"
        role="alert"
      >
        <svg class="bi flex-shrink-0 me-2" width="16" height="16" fill="currentColor">
          <use :xlink:href="ExclamationTriangleFill" />
        </svg>
        Autocomplete Table failed: {{ fetchErrors.analyzeEvidence }}
      </div>

      <div v-if="store.evidences.length !== 0" class="d-flex gap-2">
        <BaseButton @click="analyzeEvidence" :loading="loading.analyzeEvidence" class="flex-grow-1">
          Autocomplete Table
        </BaseButton>
        <HelpButton help-text="Completes the rest of the table on a best effort basis." />
      </div>

      <div
        v-if="fetchErrors.draftReport !== null"
        class="mt-3 d-flex align-items-center alert alert-danger"
        role="alert"
      >
        <svg class="bi flex-shrink-0 me-2" width="16" height="16" fill="currentColor">
          <use :xlink:href="ExclamationTriangleFill" />
        </svg>
        Draft Report failed: {{ fetchErrors.draftReport }}
      </div>

      <div v-if="store.analysedMatrix !== null" class="d-flex gap-2 mt-3">
        <BaseButton @click="draftReport" :loading="loading.draftReport" class="flex-grow-1">
          Draft Report

          <Teleport v-if="showSourceCheckModal" to="body">
            <BaseModal
              ref="modal"
              v-on="{ 'hidden.bs.modal': () => (showSourceCheckModal = false) }"
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
        <HelpButton
          help-text="Drafts a report summarising whether each claim is likely true or false."
        />
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped></style>
