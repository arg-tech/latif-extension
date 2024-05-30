<script setup>
import { inject } from 'vue'
import EvidenceTuner from '@/components/EvidenceTuner.vue'
import TableHeader from '@/components/TableHeader.vue'

const sliderIndex = inject('sliderIndex')

defineProps(['responses', 'evidences'])

function addColorSlider(index, index2) {
  sliderIndex.value = [index, index2]
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
          v-for="(hypothesis, index) in responses.get_claims.output.hypothesis"
          :key="index"
          :hypothesis="hypothesis"
        />
      </tr>
    </thead>
    <tbody>
      <tr v-for="(evidence, index) in evidences" :key="index">
        <td>
          {{ evidence }}
          <div v-if="sliderIndex && sliderIndex[0] === index" class="mt-3">
            <EvidenceTuner />
          </div>
        </td>
        <template v-if="!responses.analyze">
          <td v-for="(_, index2) in responses.get_claims.output.hypothesis" :key="index2"></td>
        </template>
        <template v-else>
          <td
            v-for="(score, index2) in responses.analyze.output.full_scoring_matrix"
            :style="{ backgroundColor: getBackgroundColor(score[index]) }"
            :key="index2"
            @click.prevent="addColorSlider(index, index2)"
          ></td>
        </template>
      </tr>
    </tbody>
  </table>
</template>
