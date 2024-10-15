<script setup>
import AchTable from '@/components/AchTable.vue'
import BaseHeader from '@/components/BaseHeader.vue'
import BaseFooter from '@/components/BaseFooter.vue'
import AnalyseArticleButton from '@/components/AppAnalyseArticleButton.vue'
import AutocompleteTableButton from '@/components/AppAutocompleteButton.vue'
import DraftReportButton from '@/components/AppDraftReportButton.vue'
// import HelpButton from '@/components/AppHelpButton.vue'
import { useStore } from '@/store'
import { doUrlsMatch, getCurrentTab } from '@/utils'
import BaseButton from '@/components/BaseButton.vue'
import UndoIcon from 'bootstrap-icons/icons/arrow-counterclockwise.svg'
import RedoIcon from 'bootstrap-icons/icons/arrow-clockwise.svg'
import SaveIcon from 'bootstrap-icons/icons/floppy.svg'
import LoadIcon from 'bootstrap-icons/icons/folder.svg'
import HelpIcon from 'bootstrap-icons/icons/info-lg.svg'

const store = useStore()

async function tableDrop() {
  const tab = await getCurrentTab()
  const url = (await chrome.tabs.sendMessage(tab.id, { action: 'getFragmentUrl' })).url
  const text = (await chrome.tabs.sendMessage(tab.id, { action: 'getSelectionText' })).text

  if (doUrlsMatch(tab.url, store.articleUrl)) {
    store.addHypothesis(text)
  } else {
    store.addEvidence(text, url)
  }
}
</script>

<template>
  <div class="flex-column min-vh-100 d-flex" @drop="tableDrop" @dragover.prevent>
    <BaseHeader class="mt-2 mb-4 container-fluid" />

    <main class="container-fluid flex-grow-1">
      <div class="d-flex justify-content-between mb-2">
        <BaseButton @click="store.undo"><UndoIcon class="p-0 align-self-center" /> Undo</BaseButton>
        <BaseButton @click="store.redo"><RedoIcon /> Redo</BaseButton>
        <BaseButton @click="store.save"><SaveIcon /> Save</BaseButton>
        <BaseButton @click="store.load"><LoadIcon /> Load</BaseButton>
        <a href="https://latif.arg.tech" target="_blank"><BaseButton><HelpIcon /> Help</BaseButton></a>
      </div>

      <div class="mb-2">
        <AnalyseArticleButton />
      </div>

      <div class="d-flex my-3 gap-2" v-if="store.hypotheses.length !== 0">
        <div class="table-responsive">
          <AchTable class="mb-0"></AchTable>
        </div>
        <!-- <HelpButton
          help-text="Drag and drop supporting and opposing evidence from other sources into the table for evaluation."
        /> -->
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
