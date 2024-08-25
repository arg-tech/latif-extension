<script setup>
import ThumbsUp from 'bootstrap-icons/icons/hand-thumbs-up-fill.svg'
import ThumbsDown from 'bootstrap-icons/icons/hand-thumbs-down-fill.svg'
import { useStore } from '@/store'
import { storeToRefs } from 'pinia'

const store = useStore()

const { evidenceTunerCellRef } = storeToRefs(store)
</script>

<template>
  <div class="d-flex flex-column">
    <input
      v-model="store.manualMatrix[evidenceTunerCellRef[1]][evidenceTunerCellRef[0]]"
      type="range"
      min="-1"
      max="1"
      step="0.01"
      class="form-range"
    />
    <div class="d-flex justify-content-between">
      <ThumbsDown />
      <ThumbsUp />
    </div>
  </div>
</template>
