<script setup>
import { ref } from 'vue'
import BaseModal from '@/components/BaseModal.vue'
import ClaimEditor from '@/components/AchTableClaimEditor.vue'
import { useStore } from '@/store'

const store = useStore()

const isActive = ref(false)
const claimEditor = ref(null)

function addClaim(claim) {
  store.addHypothesis(claim)
  isActive.value = false
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
      v-model="isActive"
      @confirm="() => claimEditor.confirmClaim()"
      v-on="{ 'shown.bs.modal': () => claimEditor.focus() }"
      title="Add Claim"
    >
      <ClaimEditor ref="claimEditor" @claim="addClaim" />
    </BaseModal>
  </div>
</template>
