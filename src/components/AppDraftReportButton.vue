<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import FetchAlert from '@/components/AppButtonFetchAlert.vue'
// import HelpButton from '@/components/AppHelpButton.vue'

const store = useStore()
const useFetchReturn = ref(null)

const showSourceCheckModal = ref(false)

function handleDraftButton() {
  function areDraftReportConditionsMet() {
    // Check number of unique URLs is acceptable.
    let uniqueUrls = new Set()
    for (const e of store.evidences) {
      if (!e?.url) {
        continue
      }

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

  useFetchReturn.value = store.draftReport()
}

function sourceCheckModalConfirm() {
  useFetchReturn.value = store.draftReport()
  showSourceCheckModal.value = false
}
</script>

<template>
  <FetchAlert v-if="useFetchReturn?.error" class="mb-3">
    Draft Report failed: {{ useFetchReturn.error }}
  </FetchAlert>

  <div class="d-flex gap-2">
    <BaseButton
      @click="handleDraftButton"
      :loading="useFetchReturn?.isFetching"
      class="flex-grow-1 col-5"
    >
      Draft Report

      <BaseModal
        v-model="showSourceCheckModal"
        @confirm="sourceCheckModalConfirm"
        title="Warning: Insufficient Evidence and Source Variety"
        confirmButtonText="Continue anyway"
      >
        You are trying to generate a report which doesn't have either enough evidences, or all of
        your evidences are from the same source. Try doing:
        <ul>
          <li>Add more than two evidences in the table.</li>
          <li>Add more evidence from different sources (webpages).</li>
        </ul>
      </BaseModal>
    </BaseButton>
    <div class="text-center fst-italic col-7">
      Click to draft a report analysing this article
    </div>
  </div>
</template>
