<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'
import BaseButton from '@/components/BaseButton.vue'
import FetchAlert from '@/components/AppButtonFetchAlert.vue'
// import HelpButton from '@/components/AppHelpButton.vue'

const store = useStore()
const useFetchReturn = ref(null)

function autocompleteTable() {
  useFetchReturn.value = store.analyzeEvidence()
}
</script>

<template>
  <FetchAlert v-if="useFetchReturn?.error" class="mb-3">
    Autocomplete Table failed: {{ useFetchReturn.error }}
  </FetchAlert>

  <div class="d-flex gap-2">
    <BaseButton
      @click="autocompleteTable"
      :loading="useFetchReturn?.isFetching"
      class="flex-grow-1 col-5"
    >
      Autocomplete Table
    </BaseButton>
     <p class="text-center col-7 fst-italic">Click on a cell to manually modify the assessment</p>
  </div>
</template>
