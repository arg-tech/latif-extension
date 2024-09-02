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
  <div>
    <button
      ref="tooltipElement"
      type="button"
      class="btn btn-outline-info border-0 rounded-circle d-flex align-items-center justify-content-center p-0 square-button"
      data-bs-toggle="tooltip"
      :data-bs-title="helpText"
    >
      <HelpIcon width="60%" height="60%" />
    </button>
  </div>
</template>

<style scoped>
.square-button {
  aspect-ratio: 1 / 1;
  width: 38px;
}
</style>
