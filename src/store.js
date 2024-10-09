import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createFetch } from '@vueuse/core'
import { getCurrentTab } from '@/utils'
import contentCssUrl from '@/content.css?url'

const fetchOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json'
  }
}

export const useStore = defineStore('store', () => {
  const hypotheses = ref([])
  const manualMatrix = ref([])
  const analysedMatrix = ref(null)
  const evidences = ref([])
  const evidenceTunerCellRef = ref(null)
  const articleUrl = ref(null)

  const achMatrix = computed(() => {
    if (analysedMatrix.value === null) {
      return manualMatrix.value
    }

    return manualMatrix.value
      .map((innerArr) => innerArr.slice())
      .map((x, i) => {
        return x.map((y, j) => {
          // Prioritise the manual matrix's values, only falling back to full_scoring_matrix if the
          // first array exists. Fixes bug where table disappears if a new claim is added once
          // full_scoring_matrix exists.
          if (y !== undefined || analysedMatrix.value[i] === undefined) {
            return y
          }

          return analysedMatrix.value[i][j]
        })
      })
  })

  function addHypothesis(claim) {
    if (claim) {
      hypotheses.value.push(claim)
      manualMatrix.value.push(Array.from({ length: evidences.value.length }, () => undefined))
    }
  }

  function deleteHypothesis(index) {
    hypotheses.value.splice(index, 1)
    manualMatrix.value.splice(index, 1)

    if (analysedMatrix.value !== null) {
      analysedMatrix.value.splice(index, 1)
    }
  }

  function addEvidence(evidence, url) {
    if (evidence) {
      evidences.value.push({ text: evidence, url })
      manualMatrix.value.map((x) => x.push(undefined))
    }
  }

  function deleteEvidence(index) {
    evidences.value.splice(index, 1)
    manualMatrix.value.map((x) => x.splice(index, 1))

    if (analysedMatrix.value !== null) {
      analysedMatrix.value.map((x) => x.splice(index, 1))
    }
  }

  async function addHeadingToTable() {
    const tab = await getCurrentTab()

    const articleHeading = (await chrome.tabs.sendMessage(tab.id, { action: 'getHeading' })).text

    hypotheses.value.unshift(articleHeading)

    manualMatrix.value.unshift(Array())
  }

  async function addSubheadingToTable() {
    const tab = await getCurrentTab()

    const articleSubHeading = (await chrome.tabs.sendMessage(tab.id, { action: 'getSubheading' }))
      .text

    hypotheses.value.unshift(articleSubHeading)

    manualMatrix.value.unshift(Array())
  }

  const analyseThisNewsArticle = createFetch({
    fetchOptions,
    combination: 'chaining',
    options: {
      async beforeFetch({ options, url }) {
        url = 'http://178.79.182.88:8080/get_claims/'

        // Get article text
        const tab = await getCurrentTab()
        const articleText = (await chrome.tabs.sendMessage(tab.id, { action: 'getArticleText' }))
          .text

        console.log(articleText)

        articleUrl.value = tab.url

        options.body = JSON.stringify({
          text: articleText
        })

        return { url, options }
      },
      async afterFetch(ctx) {
        const get_claims = await ctx.response.json()

        hypotheses.value = get_claims.output.hypothesis

        manualMatrix.value = Array.from({ length: hypotheses.value.length }, () => Array())

        addHeadingToTable()
        addSubheadingToTable()

        // Log the hypotheses to help with debugging.
        console.log('Hypotheses: ', hypotheses.value)

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        // Highlight the hypotheses on the webpage.
        chrome.tabs.sendMessage(tab.id, {
          action: 'highlightHypotheses',
          hypotheses: hypotheses.value
        })

        chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: [contentCssUrl]
        })

        return ctx
      },
      updateDataOnError: true,
      onFetchError(ctx) {
        // ctx.data can be null when 5xx response
        if (ctx.data === null) {
          addHeadingToTable()
          addSubheadingToTable()
        }

        return ctx
      }
    }
  })

  const analyzeEvidence = createFetch({
    fetchOptions,
    combination: 'chaining',
    options: {
      async beforeFetch({ options, url }) {
        url = 'http://178.79.182.88:8080/analyze/'

        options.body = JSON.stringify({
          hypothesis: hypotheses.value,
          manual_evidences: evidences.value.map((t) => t.text),
          max_alignment_limit: -1,
          min_alignment_limit: -1
        })

        return { url, options }
      },
      async afterFetch(ctx) {
        const analyse = await ctx.response.json()

        analysedMatrix.value = analyse.output.full_scoring_matrix

        // The api seems to return the hypotheses in reverse order. We assume this means that the
        // matrix is in reverse order too, so check that this is still true at runtime, and flip
        // it if it is.
        // See Analysed hypotheses output below to confirm.
        if (
          analyse.output.ordered_hypothesises[0] === hypotheses.value[hypotheses.value.length - 1]
        ) {
          analysedMatrix.value.reverse()
        }

        // Log the returned ach table to help with debugging.
        console.log('Analysed matrix: ', analysedMatrix.value)

        // Also log the returned hypotheses as they appear to be getting flipped.
        console.log('Analysed hypotheses: ', analyse.output.ordered_hypothesises)

        return ctx
      }
    }
  })

  const draftReport = createFetch({
    fetchOptions,
    combination: 'chaining',
    options: {
      async beforeFetch({ options, url }) {
        url = 'http://178.79.182.88:8000/generate_check_result_article/'

        options.body = JSON.stringify({
          ordered_hypothesises: hypotheses.value,
          full_ordered_evidences: evidences.value.map((t) => t.text),
          full_scoring_matrix: achMatrix.value
        })

        return { url, options }
      },
      async afterFetch(ctx) {
        const article = (await ctx.response.json()).output.article

        let textBlob = new Blob([article], { type: 'text/plain' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(textBlob)
        link.download = 'report' // Filename
        link.click()
        URL.revokeObjectURL(link.href)

        // Log the response to help with debugging.
        console.log('Report: ', ctx.data)
        return ctx
      }
    }
  })

  return {
    hypotheses,
    manualMatrix,
    analysedMatrix,
    evidences,
    evidenceTunerCellRef,
    articleUrl,
    achMatrix,
    addHypothesis,
    deleteHypothesis,
    addEvidence,
    deleteEvidence,
    analyseThisNewsArticle,
    analyzeEvidence,
    draftReport
  }
})
