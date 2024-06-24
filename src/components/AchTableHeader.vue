<script setup>
import * as bootstrap from 'bootstrap'
import { onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from 'vue'

defineProps(['hypothesis'])
const tooltip = ref(null)
const tooltipElement = ref(null)

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
  <th ref="tooltipElement" data-bs-toggle="tooltip" :data-bs-title="hypothesis" class="text-nowrap">
    {{ hypothesis.length < 10 ? hypothesis : hypothesis.slice(0, 10).trimEnd() + '...' }}
  </th>
</template>
