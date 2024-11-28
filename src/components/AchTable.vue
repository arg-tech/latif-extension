<script setup>
import AddClaim from '@/components/AchTableAddClaim.vue'
import AddEvidence from '@/components/AchTableAddEvidence.vue'
import EvidenceCell from '@/components/AchTableEvidenceCell.vue'
import EvidenceTuner from '@/components/AchTableEvidenceTuner.vue'
import TableHeader from '@/components/AchTableHeader.vue'
import { useStore } from '@/store'
import { storeToRefs } from 'pinia'

const store = useStore()

const { evidenceTunerCellRef } = storeToRefs(store)

function activateEvidenceTuner(rowIndex, colIndex) {
  // Remove the evidence tuner if the same cell is clicked on twice.
  if (
    evidenceTunerCellRef.value &&
    evidenceTunerCellRef.value[0] == rowIndex &&
    evidenceTunerCellRef.value[1] == colIndex
  ) {
    evidenceTunerCellRef.value = null
    return
  }

  evidenceTunerCellRef.value = [rowIndex, colIndex]
}

function getBackgroundColor(score) {
  // When using the slider it updates as a string.
  if (typeof score !== 'number' && typeof score !== 'string') {
    return
  }

  score = parseFloat(score)

  let green, red

  switch (score) {
    case -1:
      red = 255
      green = 0
      break
    case -0.5:
      red = 255
      green = 128
      break
    // The api returns -1000 for any evidence that it doesn't think is relevant.
    case 0:
    case -1000:
      red = 255
      green = 255
      break
    case 0.5:
      red = 128
      green = 255
      break
    case 1:
      red = 0
      green = 128
      break
    default:
      red = 255
      green = 255
      break
  }

  // Change bg colour of cell with colour calculated earlier.
  const toHex = (c) => c.toString(16).padStart(2, '0')
  return `#${toHex(red)}${toHex(green)}${toHex(0)}`
}
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th class="position-sticky top-0 start-0 z-1"><AddClaim /></th>
        <TableHeader
          v-for="(hypothesis, colIndex) in store.hypotheses"
          :key="colIndex"
          :hypothesis="hypothesis"
          :index="colIndex"
          class="position-sticky top-0 row-0"
        />
      </tr>
    </thead>
    <tbody>
      <tr v-for="(evidence, rowIndex) in store.evidences" :key="rowIndex">
        <EvidenceCell :evidence :rowIndex class="position-sticky start-0" />
        <td
          v-for="(scoreCol, colIndex) in store.achMatrix"
          :style="{ backgroundColor: getBackgroundColor(scoreCol[rowIndex]) }"
          :key="colIndex"
          @click.prevent="activateEvidenceTuner(rowIndex, colIndex)"
        >
          <div
            v-if="
              evidenceTunerCellRef &&
              evidenceTunerCellRef[0] === rowIndex &&
              evidenceTunerCellRef[1] === colIndex
            "
            class="mt-3"
          >
            <EvidenceTuner />
          </div>
        </td>
      </tr>
      <tr>
        <td class="position-sticky start-0"><AddEvidence /></td>
        <td :colspan="store.achMatrix.length" />
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
tr td:not(:first-child) {
    border-left: 1px solid var(--bs-border-color);
}
</style>
