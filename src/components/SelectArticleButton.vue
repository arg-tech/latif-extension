<script setup>
import { ref } from 'vue'
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg'
import { useStore } from '@/store'
import BaseButton from '@/components/BaseButton.vue'
import HelpButton from '@/components/HelpButton.vue'

const store = useStore()
const useFetchReturn = ref(null)

function selectThisNewsArticle() {
  useFetchReturn.value = store.selectThisNewsArticle()
}
</script>

<template>
  <div
    v-if="useFetchReturn?.error"
    class="mt-3 d-flex align-items-center alert alert-danger"
    role="alert"
  >
    <ExclamationTriangleFill class="flex-shrink-0 me-2" />
    Select This News Article failed: {{ useFetchReturn.error }}
  </div>

  <div class="d-flex gap-2">
    <BaseButton
      @click="selectThisNewsArticle"
      :loading="useFetchReturn?.isFetching"
      class="flex-grow-1"
    >
      Select This News Article
    </BaseButton>
    <HelpButton help-text="Automatically identifies the claims made in this article." />
  </div>
</template>
