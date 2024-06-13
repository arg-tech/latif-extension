<script setup>
import * as bootstrap from 'bootstrap'
import TrashIcon from 'bootstrap-icons/bootstrap-icons.svg#trash'
import { onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import { useStore } from '@/store'

const store = useStore()

defineProps(['hypothesis', 'index'])
const tooltip = ref(null)
const tooltipElement = ref(null)

function deleteHypothesis(index) {
  store.responses.get_claims.output.hypothesis.splice(index, 1)

  if (store.responses.analyze) {
    store.responses.analyze.output.full_scoring_matrix.splice(index, 1)
  }
}

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
</script>

<template>
  <th ref="tooltipElement" data-bs-toggle="tooltip" :data-bs-title="hypothesis">
    <div class="d-flex align-items-center">
      <span class="text-nowrap">
        {{ hypothesis.length < 10 ? hypothesis : hypothesis.slice(0, 10).trimEnd() + '...' }}
      </span>
      <button
        @click="deleteHypothesis(index)"
        type="button"
        class="btn btn-sm btn-outline-danger ms-1"
      >
        <svg class="bi bi-trash" width="16" height="16" fill="currentColor">
          <use :xlink:href="TrashIcon" />
        </svg>
      </button>
    </div>
  </th>
</template>
