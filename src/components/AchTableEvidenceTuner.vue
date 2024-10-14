<script setup>
import { useStore } from '@/store'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const store = useStore()

const { evidenceTunerCellRef } = storeToRefs(store)
const sliderLabel = ref(null)

function updateLabel(event) {
  switch (event.target.value) {
    case '-1':
      sliderLabel.value = 'Not supporting'
      break
    case '-0.5':
      sliderLabel.value = 'Mainly not supporting'
      break
    case '0':
      sliderLabel.value = 'Neutral'
      break
    case '0.5':
      sliderLabel.value = 'Mainly supporting'
      break
    case '1':
      sliderLabel.value = 'Supporting'
      break
    default:
      sliderLabel.value = 'Error :('
  }
}
</script>

<template>
  <div class="d-flex flex-column">
    <input
      @input="updateLabel"
      v-model="store.manualMatrix[evidenceTunerCellRef[1]][evidenceTunerCellRef[0]]"
      type="range"
      min="-1"
      max="1"
      step="0.5"
      class="form-range"
    />
    <p>
      {{ sliderLabel }}
    </p>
  </div>
</template>
