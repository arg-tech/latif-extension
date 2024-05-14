<script setup>
import PageButton from './components/PageButton.vue'
import PageHeader from './components/PageHeader.vue'
import PageFooter from './components/PageFooter.vue'
import TableHeader from './components/TableHeader.vue'
</script>

<template>
  <main class="container-fluid mt-2 flex-grow-1">
    <PageHeader class="mb-4" />
    <div class="d-grid gap-2">
      <PageButton @click="extractClaims" :loading="loading.extractClaims">Extract Claims</PageButton>
    </div>
    <div class="table-responsive my-3" v-if="responses.get_claims">
      <table class="table table-bordered" @dragover.prevent @drop.prevent="tableDrop">
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
                :style="{ backgroundColor: getBackgroundColor(score[index]) }"
                :key="index2"
                @click.prevent="addColorSlider(index, index2)"
              ></td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="evidences.length !== 0" class="d-grid gap-2">
      <PageButton @click="analyzeEvidence" :loading="loading.analyzeEvidence">Analyse Evidence</PageButton>
    </div>

    <div v-if="responses.analyze" class="d-grid gap-2 mt-3">
      <PageButton @click="generateReport" :loading="loading.generateReport">Generate Report</PageButton>
    </div>

    <div v-if="sliderIndex" class="mt-3">
      <input
        v-model="responses.analyze.output.full_scoring_matrix[sliderIndex[1]][sliderIndex[0]]"
        type="range"
        list="values"
        min="-1"
        max="1"
        step="0.01"
      />
      <datalist id="values">
        <option value="-1" label="low"></option>
        <option value="0" label="medium"></option>
        <option value="1" label="high"></option>
      </datalist>
    </div>
  </main>

  <PageFooter />
</template>

<style scoped></style>

<script>
export default {
  data() {
    return {
      responses: { get_claims: null, analyze: null },
      loading: { extractClaims: false, analyzeEvidence: false, generateReport: false },
      evidences: [],
      sliderIndex: null
    }
  },

  methods: {
    async extractClaims() {
      // Add the loading spinner.
      this.loading.extractClaims = true

      // Get article text
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      const articleText = (await chrome.tabs.sendMessage(tab.id, { action: 'getArticleText' })).text

      console.log(articleText)

      // Fetch page data from the API.
      this.responses.get_claims = await fetch('http://178.79.182.88:8080/get_claims/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: articleText
        })
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then((data) => {
          return data
        })
        .catch((error) => {
          console.error('There has been a problem with your fetch operation:', error)
        })

      // Log the response to help with debugging.
      console.log('get_claims: ', this.responses.get_claims)

      // Remove the loading spinner.
      this.loading.extractClaims = false
    },

    tableDrop(event) {
      let data = event.dataTransfer.getData('text/plain')
      this.evidences.push(data)
    },

    async analyzeEvidence() {
      // Add the loading spinner.
      this.loading.analyzeEvidence = true

      // Fetch page data from the API.
      this.responses.analyze = await fetch('http://178.79.182.88:8080/analyze/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hypothesis: this.responses.get_claims.output.hypothesis,
          manual_evidences: this.evidences,
          max_alignment_limit: -1,
          min_alignment_limit: -1,
          hypothesis_nodes: this.responses.get_claims.output.hypothesis_nodes,
          structure_hypothesis_graph: this.responses.get_claims.output.structure_hypothesis_graph
        })
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then((data) => {
          return data
        })
        .catch((error) => {
          console.error('There has been a problem with your fetch operation:', error)
        })

      // Log the response to help with debugging.
      console.log('Analyze: ', this.responses.analyze.output)

      // Remove the loading spinner.
      this.loading.analyzeEvidence = false
    },

    getBackgroundColor(score) {
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
    },

    addColorSlider(index, index2) {
      this.sliderIndex = [index, index2]
    },

    async generateReport() {
      // Add the loading spinner.
      this.loading.generateReport = true

      // Used for debugging the API response.
      let report

      // The other option here is: generate_per_claim_articles
      await fetch('http://178.79.182.88:8000/generate_check_result_article/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.responses.analyze.output)
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok')
          }
          return response.json()
        })
        .then((response) => {
          report = response
          response = response.output.article
          let textBlob = new Blob([response], { type: 'text/plain' })
          const link = document.createElement('a')
          link.href = URL.createObjectURL(textBlob)
          link.download = 'report' // Filename
          link.click()
          URL.revokeObjectURL(link.href)
        })
        .catch((error) => {
          console.error('Error downloading file:', error)
        })

      console.log('Report: ', report.output)

      // Remove the loading spinner.
      this.loading.generateReport = false
    }
  }
}
</script>
