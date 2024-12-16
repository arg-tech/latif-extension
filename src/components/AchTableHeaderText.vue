<script setup>
import {
  computed,
  defineEmits,
  defineProps,
  ref,
  onBeforeUpdate,
  onMounted,
  onUnmounted,
  onUpdated
} from 'vue'
import ClaimEditor from '@/components/AchTableClaimEditor.vue'
import BaseModal from '@/components/BaseModal.vue'
import { useStore } from '@/store'
import * as bootstrap from 'bootstrap'

const props = defineProps({ hypothesis: String, index: Number })
const emits = defineEmits(['click'])

const store = useStore()
const isActive = ref(false)
const claimEditor = ref(null)
const tooltip = ref(null)
const tooltipElement = ref(null)

const shortHypothesis = computed(() =>
  props.hypothesis.length < 10 ? props.hypothesis : props.hypothesis.slice(0, 10).trimEnd() + '...'
)

function editClaim(claim) {
  store.hypotheses[props.index] = claim
  isActive.value = false
}

function click() {
  tooltip.value.hide()
  isActive.value = true
  emits('click')
}

onMounted(() => {
  initTooltip()
})

onUnmounted(() => {
  // Dispose of the tooltip before unmounting, stops tooltip staying after item is deleted.
  disposeTooltip()
})

onBeforeUpdate(() => {
  // Dispose of the tooltip before updating.
  disposeTooltip()
})

onUpdated(() => {
  // Reinitialize the tooltip after data updates.
  initTooltip()
})

function initTooltip() {
  if (tooltipElement.value) {
    tooltip.value = new bootstrap.Tooltip(tooltipElement.value)
  }
}

function disposeTooltip() {
  if (tooltip.value) {
    tooltip.value.dispose()
    tooltip.value = null
  }
}
</script>

<template>
  <span
    @click="click"
    class="text-nowrap"
    role="button"
    tabindex="0"
    ref="tooltipElement"
    data-bs-toggle="tooltip"
    :data-bs-title="hypothesis"
  >
    {{ shortHypothesis }}
  </span>

  <BaseModal
    v-model="isActive"
    @shown="() => claimEditor.focus()"
    @confirm="() => claimEditor.confirmClaim()"
    title="Edit Claim"
    confirmButtonText="Save changes"
  >
    <ClaimEditor ref="claimEditor" @claim="editClaim" :initial-value="hypothesis" />
  </BaseModal>
</template>
