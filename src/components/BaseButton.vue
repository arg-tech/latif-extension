<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as bootstrap from 'bootstrap'

defineProps({ loading: Boolean, tooltip: String })

const tooltipObj = ref(null)
const tooltipElement = ref(null)

onMounted(() => {
  tooltipObj.value = new bootstrap.Tooltip(tooltipElement.value)
})

onUnmounted(() => {
  if (tooltipObj.value) {
    tooltipObj.value.dispose()
    tooltipObj.value = null
  }
})
</script>

<template>
  <button
    ref="tooltipElement"
    type="button"
    :disabled="loading"
    class="btn btn-primary"
    data-bs-toggle="tooltip"
    :data-bs-title="tooltip"
  >
    <slot />
    <span v-if="loading" aria-hidden="true" class="spinner-border spinner-border-sm ms-2"></span>
  </button>
</template>
