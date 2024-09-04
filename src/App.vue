<script setup>
import AchTable from '@/components/AchTable.vue'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import SelectArticleButton from '@/components/AppSelectArticleButton.vue'
import AutocompleteTableButton from '@/components/AppAutocompleteButton.vue'
import DraftReportButton from '@/components/AppDraftReportButton.vue'
import HelpButton from '@/components/AppHelpButton.vue'
import { useStore } from '@/store'
import { doUrlsMatch, ensureContentScriptIsReady } from '@/utils'

const store = useStore()

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
</script>

<template>
  <div class="flex-column min-vh-100 d-flex" @drop="tableDrop" @dragover.prevent>
    <BaseHeader class="mt-2 mb-4 container-fluid" />

    <main class="container-fluid flex-grow-1">
      <div class="mb-3">
        <SelectArticleButton />
      </div>

      <div class="d-flex my-3 gap-2" v-if="store.hypotheses.length !== 0">
        <div class="table-responsive">
          <AchTable class="mb-0"></AchTable>
        </div>
        <HelpButton
          help-text="Drag and drop supporting and opposing evidence from other sources into the table for evaluation."
        />
      </div>

      <div v-if="store.evidences.length !== 0" class="my-3">
        <AutocompleteTableButton />
      </div>

      <div v-if="store.analysedMatrix !== null" class="my-3">
        <DraftReportButton />
      </div>
    </main>

    <BaseFooter />
  </div>
</template>

<style scoped></style>
