<script setup>
import { ref } from 'vue'
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg'
import { useStore } from '@/store'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import HelpButton from '@/components/HelpButton.vue'

const store = useStore()
const useFetchReturn = ref(null)
const modal = ref(null)
const showSourceCheckModal = ref(false)

function selectThisNewsArticle() {
  showSourceCheckModal.value = true
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

      <Teleport v-if="showSourceCheckModal" to="body">
        <BaseModal
          ref="modal"
          v-on="{ 'hidden.bs.modal': () => (showSourceCheckModal = false) }"
          @confirm="modal.hide()"
          title="Survey"
          confirmButtonText="Continue"
        >
          Survey form here
        </BaseModal>
      </Teleport>
    </BaseButton>
    <HelpButton help-text="Automatically identifies the claims made in this article." />
  </div>
</template>
