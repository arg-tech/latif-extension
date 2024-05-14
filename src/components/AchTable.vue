<script setup>
import TableHeader from './TableHeader.vue'
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
        </td>
        <template v-if="!responses.analyze">
          <td v-for="(_, index2) in responses.get_claims.output.hypothesis" :key="index2"></td>
        </template>
        <template v-else>
          <td
            v-for="(score, index2) in responses.analyze.output.full_scoring_matrix"
            :style="{ backgroundColor: $parent.getBackgroundColor(score[index]) }"
            :key="index2"
            @click.prevent="$parent.addColorSlider(index, index2)"
          ></td>
        </template>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  props: ['responses', 'evidences']
}
</script>
