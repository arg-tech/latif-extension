import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createFetch } from '@vueuse/core'
import { ensureContentScriptIsReady } from '@/utils'

const fetchOptions = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    accept: 'application/json'
  }
}

export const useStore = defineStore('store', () => {
  const hypotheses = ref([])
  const manualMatrix = ref(null)
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

  function deleteHypothesis(index) {
    hypotheses.value.splice(index, 1)
    manualMatrix.value.splice(index, 1)

    if (analysedMatrix.value !== null) {
      analysedMatrix.value.splice(index, 1)
    }
  }

  const selectThisNewsArticle = createFetch({
    fetchOptions,
    combination: 'chaining',
    options: {
      async beforeFetch({ options, url }) {
        url = 'http://178.79.182.88:8080/get_claims/'

        // Get article text
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        // Fixes 'Receiving end does not exist' error on extension reload.
        await ensureContentScriptIsReady(tab.id)
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

        // Log the hypotheses to help with debugging.
        console.log('Hypotheses: ', hypotheses.value)

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

        // If the analyse evidence button is clicked while the evidence tuner is open,
        // the evidence tuner doesn't update to the new value.
        // This hides it until a new cell is clicked on, and it will be up to date again.
        evidenceTunerCellRef.value = null

        return { url, options }
      },
      async afterFetch(ctx) {
        const analyse = await ctx.response.json()

        analysedMatrix.value = analyse.output.full_scoring_matrix

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
    deleteHypothesis,
    selectThisNewsArticle,
    analyzeEvidence,
    draftReport
  }
})
