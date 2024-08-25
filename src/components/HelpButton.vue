<script setup>
import * as bootstrap from 'bootstrap'
import { defineProps, onMounted, onUnmounted, ref } from 'vue'
import HelpIcon from 'bootstrap-icons/bootstrap-icons.svg#question-circle'

defineProps({ helpText: String })
const tooltip = ref(null)
const tooltipElement = ref(null)

onMounted(() => {
  tooltip.value = new bootstrap.Tooltip(tooltipElement)
})

onUnmounted(() => {
  if (tooltip.value) {
    tooltip.value.dispose()
    tooltip.value = null
  }
})
</script>

<template>
  <div>
    <button
      ref="tooltipElement"
      type="button"
      class="btn btn-outline-info"
      data-bs-toggle="tooltip"
      data-bs-placement="bottom"
      data-bs-title="help-text"
    >
      <svg width="16" height="16" fill="currentColor">
        <use :xlink:href="HelpIcon" />
      </svg>
    </button>
  </div>
</template>
