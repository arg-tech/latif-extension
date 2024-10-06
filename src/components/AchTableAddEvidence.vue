<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import ClaimEditor from '@/components/AchTableClaimEditor.vue'
import { useStore } from '@/store'

const store = useStore()

const isActive = ref(false)
const modal = ref(null)
const claimEditor = ref(null)

function addEvidence(evidence) {
  store.addEvidence(evidence)
  modal.value.hide()
}
</script>

<template>
  <div class="d-grid gap-2">
    <button
      @click="isActive = true"
      type="button"
      class="btn btn-outline-success fw-bold btn-sm text-nowrap"
    >
      Add Evidence
    </button>

    <BaseModal
      ref="modal"
      v-on="{
        'hidden.bs.modal': () => (isActive = false),
        'shown.bs.modal': () => claimEditor.focus()
      }"
      @confirm="() => claimEditor.confirmClaim()"
      v-if="isActive"
      title="Add Evidence"
    >
      <ClaimEditor ref="claimEditor" @claim="addEvidence" />
    </BaseModal>
  </div>
</template>
