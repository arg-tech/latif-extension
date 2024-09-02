<script setup>
import { ref } from 'vue'
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg'
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
  <div
    v-if="useFetchReturn?.error"
    class="mb-3 d-flex align-items-center alert alert-danger"
    role="alert"
  >
    <ExclamationTriangleFill class="flex-shrink-0 me-2" />
    Autocomplete Table failed: {{ useFetchReturn.error }}
  </div>

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
