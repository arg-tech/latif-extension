<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import ClaimEditor from '@/components/AchTableClaimEditor.vue'
import { useStore } from '@/store'

const store = useStore()

const isActive = ref(false)
const modal = ref(null)
const claimEditor = ref(null)

function addClaim(claim) {
  store.addHypothesis(claim)
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
      Add Claim
    </button>

    <BaseModal
      ref="modal"
      v-on="{
        'hidden.bs.modal': () => (isActive = false),
        'shown.bs.modal': () => claimEditor.focus()
      }"
      @confirm="() => claimEditor.confirmClaim()"
      v-if="isActive"
      title="Add Claim"
    >
      <ClaimEditor ref="claimEditor" @claim="addClaim" />
    </BaseModal>
  </div>
</template>
