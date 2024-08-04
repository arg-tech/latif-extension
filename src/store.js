import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
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
  const responses = reactive({ get_claims: null, analyze: null })
  const evidences = ref([])
  const evidenceTunerCellRef = ref(null)
  const articleUrl = ref(null)

  const selectThisNewsArticle = createFetch({
    fetchOptions,
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
        responses.get_claims = await ctx.response.json()

        // Log the response to help with debugging.
        console.log('get_claims: ', responses.get_claims.output)

        return ctx
      }
    }
  })

  const analyzeEvidence = createFetch({
    fetchOptions,
    options: {
      async beforeFetch({ options, url }) {
        url = 'http://178.79.182.88:8080/analyze/'

        options.body = JSON.stringify({
          hypothesis: responses.get_claims.output.hypothesis,
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
        responses.analyze = await ctx.response.json()

        // Log the response to help with debugging.
        console.log('Analyze: ', responses.analyze.output)

        return ctx
      }
    }
  })

  const draftReport = createFetch({
    fetchOptions,
    options: {
      async beforeFetch({ options, url }) {
        url = 'http://178.79.182.88:8000/generate_check_result_article/'

        options.body = JSON.stringify({
          ordered_hypothesises: responses.analyze.output.ordered_hypothesises,
          full_ordered_evidences: responses.analyze.output.full_ordered_evidences,
          full_scoring_matrix: responses.analyze.output.full_scoring_matrix
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
    responses,
    evidences,
    evidenceTunerCellRef,
    articleUrl,
    selectThisNewsArticle,
    analyzeEvidence,
    draftReport
  }
})
