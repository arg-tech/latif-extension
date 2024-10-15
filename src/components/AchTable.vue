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

  let red = 255
  let green = 255

  // The api returns -1000 for any evidence that it doesn't think is relevant.
  if (score < 0 && score !== -1000) {
    // If score is a string we still want numeric addition, not concatination.
    green = Math.round(255 * (1 + +score))
  } else if (score > 0) {
    red = Math.round(255 * (1 - score))
  }

  // Change bg colour of cell with colour calculated earlier.
  const toHex = (c) => c.toString(16).padStart(2, '0')
  return `#${toHex(red)}${toHex(green)}${toHex(0)}`
}
</script>

<template>
  <div class="container text-center fst-italic mb-2">
    Click “Add claim” to add your own claim in addition to those found automatically. Click on a
    claim to edit it. Select evidence in other webpages and drag onto this panel to add. Click on a
    piece of dragged-and-dropped evidence to view the source.
  </div>
  <table class="table table-bordered">
    <thead>
      <tr>
        <th><AddClaim /></th>
        <TableHeader
          v-for="(hypothesis, colIndex) in store.hypotheses"
          :key="colIndex"
          :hypothesis="hypothesis"
          :index="colIndex"
        />
      </tr>
    </thead>
    <tbody>
      <tr v-for="(evidence, rowIndex) in store.evidences" :key="rowIndex">
        <EvidenceCell :evidence :rowIndex />
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
        <td><AddEvidence /></td>
        <td :colspan="store.achMatrix.length" />
      </tr>
    </tbody>
  </table>
</template>
