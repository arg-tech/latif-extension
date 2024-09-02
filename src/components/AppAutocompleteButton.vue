<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'
import BaseButton from '@/components/BaseButton.vue'
import HelpButton from '@/components/AppHelpButton.vue'

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
      class="flex-grow-1"
    >
      Autocomplete Table
    </BaseButton>
    <HelpButton help-text="Completes the rest of the table on a best effort basis." />
  </div>
</template>
