<script setup>
import * as bootstrap from 'bootstrap'
import TrashIcon from 'bootstrap-icons/icons/trash.svg'
import { onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from 'vue'
import HeaderText from '@/components/AchTableHeaderText.vue'
import { useStore } from '@/store'

defineProps(['hypothesis', 'index'])

const store = useStore()
const tooltip = ref(null)
const tooltipElement = ref(null)

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
  <th class="align-middle">
    <div class="d-flex align-items-center">
      <HeaderText @click="tooltip.hide()" :hypothesis :index />
      <button
        ref="tooltipElement"
        data-bs-toggle="tooltip"
        data-bs-title="Remove claim"
        @click="store.deleteHypothesis(index)"
        type="button"
        class="delete-button btn btn-sm btn-outline-danger ms-1 border-0"
      >
        <TrashIcon />
      </button>
    </div>
  </th>
</template>

<style scoped>
.delete-button {
  font-size: 0px;
  padding: 7px;
}
</style>
