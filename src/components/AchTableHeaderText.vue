<script setup>
import { computed, defineEmits, defineProps, ref } from 'vue'
import ClaimEditor from '@/components/AchTableClaimEditor.vue'
import BaseModal from '@/components/BaseModal.vue'
import { useStore } from '@/store'

const props = defineProps({ hypothesis: String, index: Number })
const emits = defineEmits(['click'])

const store = useStore()
const isActive = ref(false)
const modal = ref(null)
const claimEditor = ref(null)

const shortHypothesis = computed(() =>
  props.hypothesis.length < 10 ? props.hypothesis : props.hypothesis.slice(0, 10).trimEnd() + '...'
)

function editClaim(claim) {
  store.responses.get_claims.output.hypothesis[props.index] = claim
  modal.value.hide()
}

function click() {
  isActive.value = true
  emits('click')
}
</script>

<template>
  <span @click="click" class="text-nowrap">
    {{ shortHypothesis }}
  </span>

  <Teleport v-if="isActive" to="body">
    <BaseModal
      ref="modal"
      v-on="{
        'hidden.bs.modal': () => (isActive = false),
        'shown.bs.modal': () => claimEditor.focus()
      }"
      @confirm="() => claimEditor.confirmClaim()"
      title="Edit Claim"
      confirmButtonText="Save changes"
    >
      <ClaimEditor ref="claimEditor" @claim="editClaim" :initial-value="hypothesis" />
    </BaseModal>
  </Teleport>
</template>
