<script setup>
import PageFooter from './components/PageFooter.vue'
</script>

<template>
  <main id="page" class="container-fluid mt-2 flex-grow-1">
    <div class="d-flex mb-4">
      <h1 class="me-auto">Impartial Fact Checker</h1>
      <a href="https://www.arg.tech/" target="_blank"
        ><img
          class="img-fluid me-2"
          src="/icon128.png"
          alt="ARG-tech logo"
          style="width: 40px; height: 40px"
      /></a>
    </div>
    <div class="d-grid gap-2">
      <button @click="minePage" type="button" :disabled="loading.minePage" class="btn btn-primary">
        Mine webpage
        <span
          v-if="loading.minePage"
          aria-hidden="true"
          class="spinner-border spinner-border-sm ms-2"
        ></span>
      </button>
    </div>
    <div class="table-responsive my-3" v-if="responses.get_claims">
      <table class="table table-bordered" @dragover.prevent @drop.prevent="tableDrop">
        <thead>
          <tr>
            <th>#</th>
            <th v-for="(_, index) in responses.get_claims.output.hypothesis" :key="index">
              H{{ index + 1 }}
            </th>
          </tr>
        </thead>
        <tbody v-if="!responses.analyze">
          <tr v-for="(evidence, index) in evidences" :key="index">
            <td>
              {{ evidence }}
            </td>
            <td v-for="(_, index2) in responses.get_claims.output.hypothesis" :key="index2"></td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="(evidence, index) in evidences" :key="index">
            <td>
              {{ evidence }}
            </td>
            <td
              :style="{ backgroundColor: score }"
              v-for="(score, index2) in coloredMatrix"
              :key="index2"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="evidences.length !== 0" class="d-grid gap-2">
      <button @click="analyze" type="button" :disabled="loading.analyze" class="btn btn-primary">
        Analyze ACH Table
        <span
          v-if="loading.analyze"
          aria-hidden="true"
          class="spinner-border spinner-border-sm ms-2"
        ></span>
      </button>
    </div>

    <div class="d-grid gap-2 mt-3">
      <button type="button" id="reportGenerationButton" class="btn btn-primary">
        Generate report
      </button>
    </div>

    <div class="mt-3" v-if="responses.get_claims">
      <p v-for="(hypothesis, index) in responses.get_claims.output.hypothesis" :key="index">
        <strong>H{{ index + 1 }}: </strong>
        {{ hypothesis }}
      </p>
    </div>
  </main>

  <PageFooter />
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>

<script>
export default {
  data() {
    return {
      responses: { get_claims: null, analyze: null },
      loading: { minePage: false, analyze: false },
      evidences: []
    }
  },

  computed: {
    coloredMatrix() {
      return this.responses.analyze.output.full_scoring_matrix.map((t) =>
        t.map((u) => {
          let cellColor = u
          let red, green
          if (cellColor === -1000) {
            red = 255
            green = 0
          } else if (cellColor < 0) {
            red = 255
            green = cellColor * -1 * 255
          } else if (cellColor == 0) {
            red = 255
            green = 255
          } else {
            green = 255
            red = (1 - cellColor) * 255
          }

          red = Math.round(red)
          green = Math.round(green)

          // Change bg colour of cell with colour calculated earlier.
          const toHex = (c) => c.toString(16).padStart(2, '0')
          return `#${toHex(red)}${toHex(green)}${toHex(0)}`
        })
      )
    }
  },

  methods: {
    async minePage() {
      // Add the loading spinner.
      this.loading.minePage = true

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
      this.loading.minePage = false
    },

    tableDrop(event) {
      let data = event.dataTransfer.getData('text/plain')
      this.evidences.push(data)
    },

    async analyze() {
      // Add the loading spinner.
      this.loading.analyze = true

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
      this.loading.analyze = false
    }
  }
}
</script>
