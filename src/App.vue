<script setup>
import { reactive, ref } from 'vue'
import AchTable from '@/components/AchTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import BaseModal from '@/components/BaseModal.vue'
import { useStore } from '@/store'
import { doUrlsMatch, ensureContentScriptIsReady } from '@/utils'

const store = useStore()
const modal = ref(null)
const showSourceCheckModal = ref(false)
const loading = reactive({
  selectThisNewsArticle: false,
  analyzeEvidence: false,
  draftReport: false
})

async function tableDrop() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

  // Fixes 'Receiving end does not exist' error on extension reload.
  await ensureContentScriptIsReady(tab.id)
  const url = (await chrome.tabs.sendMessage(tab.id, { action: 'getFragmentUrl' })).url
  const text = (await chrome.tabs.sendMessage(tab.id, { action: 'getSelectionText' })).text

  if (doUrlsMatch(tab.url, store.articleUrl)) {
    store.responses.get_claims.output.hypothesis.push(text)
    store.manualMatrix.push(Array.from({ length: store.evidences.length }, () => undefined))
  } else {
    store.evidences.push({ text, url })
    store.manualMatrix.map((x) => x.push(undefined))
  }
}

function selectThisNewsArticle() {
  const useFetchReturn = store.selectThisNewsArticle()
  loading.selectThisNewsArticle = useFetchReturn.isFetching
}

function analyzeEvidence() {
  const useFetchReturn = store.analyzeEvidence()
  loading.analyzeEvidence = useFetchReturn.isFetching
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
}

function sourceCheckModalConfirm() {
  const useFetchReturn = store.draftReport()
  loading.draftReport = useFetchReturn.isFetching
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
          Autocomplete Table
        </BaseButton>
      </div>

      <div v-if="store.responses.analyze" class="d-grid gap-2 mt-3">
        <BaseButton @click="draftReport" :loading="loading.draftReport">
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
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped></style>
