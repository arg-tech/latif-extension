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
  const loading = reactive({ draftReport: false })
  const evidences = ref([])
  const evidenceTunerCellRef = ref(null)
  const selectThisNewsArticleUrl = ref(null)

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

        selectThisNewsArticleUrl.value = tab.url

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
          ...responses.get_claims.output,
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

  async function draftReport() {
    // Add the loading spinner.
    loading.draftReport = true

    try {
      // The other option here is: generate_per_claim_articles
      const response = await fetch('http://178.79.182.88:8000/generate_check_result_article/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json'
        },
        body: JSON.stringify(responses.analyze.output)
      })

      if (!response.ok) {
        return
      }

      const article = (await response.json()).output.article

      let textBlob = new Blob([article], { type: 'text/plain' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(textBlob)
      link.download = 'report' // Filename
      link.click()
      URL.revokeObjectURL(link.href)

      console.log('Report: ', response.output)
    } finally {
      // Remove the loading spinner.
      loading.draftReport = false
    }
  }

  return {
    responses,
    loading,
    evidences,
    evidenceTunerCellRef,
    selectThisNewsArticleUrl,
    selectThisNewsArticle,
    analyzeEvidence,
    draftReport
  }
})
