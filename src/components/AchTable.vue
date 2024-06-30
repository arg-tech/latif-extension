<script setup>
import EvidenceCell from '@/components/AchTableEvidenceCell.vue'
import TableHeader from '@/components/AchTableHeader.vue'
import { useStore } from '@/store'
import { storeToRefs } from 'pinia'

const store = useStore()

const { evidenceTunerCellRef } = storeToRefs(store)

defineProps(['evidences'])

function activateEvidenceTuner(rowIndex, colIndex) {
  console.log(evidenceTunerCellRef)
  // Don't show evidence tuner on cells that aren't coloured.
  if (store.responses.analyze.output.full_scoring_matrix[colIndex][rowIndex] === undefined) {
    return
  }

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

  if (score === -1000) {
    green = 0
  } else if (score < 0) {
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
  <table class="table table-bordered" @dragover.prevent>
    <thead>
      <tr>
        <th>#</th>
        <TableHeader
          v-for="(hypothesis, colIndex) in store.responses.get_claims.output.hypothesis"
          :key="colIndex"
          :hypothesis="hypothesis"
        />
      </tr>
    </thead>
    <tbody>
      <tr v-for="(evidence, rowIndex) in evidences" :key="rowIndex">
        <EvidenceCell :evidence :rowIndex />
        <template v-if="!store.responses.analyze">
          <td
            v-for="(_, colIndex) in store.responses.get_claims.output.hypothesis"
            :key="colIndex"
          ></td>
        </template>
        <template v-else>
          <td
            v-for="(scoreCol, colIndex) in store.responses.analyze.output.full_scoring_matrix"
            :style="{ backgroundColor: getBackgroundColor(scoreCol[rowIndex]) }"
            :key="colIndex"
            @click.prevent="activateEvidenceTuner(rowIndex, colIndex)"
          ></td>
        </template>
      </tr>
    </tbody>
  </table>
</template>
