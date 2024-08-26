<script setup>
import * as bootstrap from 'bootstrap'
import { defineProps, onMounted, onUnmounted, ref } from 'vue'
import HelpIcon from 'bootstrap-icons/icons/question-lg.svg'

defineProps({ helpText: String })
const tooltip = ref(null)
const tooltipElement = ref(null)

onMounted(() => {
  tooltip.value = new bootstrap.Tooltip(tooltipElement.value)
})

onUnmounted(() => {
  if (tooltip.value) {
    tooltip.value.dispose()
    tooltip.value = null
  }
})
</script>

<template>
  <button
    ref="tooltipElement"
    type="button"
    class="btn btn-outline-info border border-0 rounded-circle p-0"
    style="height: 38px; width: 38px; font-size: 20px"
    data-bs-toggle="tooltip"
    :data-bs-title="helpText"
  >
    <HelpIcon width="1em" height="1em" />
  </button>
</template>
