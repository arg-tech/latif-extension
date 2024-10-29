import { defineStore } from 'pinia'
import { computed, ref, reactive, toRaw } from 'vue'
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

const usePrivateState = defineStore('store-private', () => {
  const undoStack = reactive([])
  const undoStackPointer = ref(-1)

  return { undoStack, undoStackPointer }
})

export const useStore = defineStore('store', () => {
  const privateStore = usePrivateState()
  const hypotheses = ref([])
  const manualMatrix = ref([])
  const analysedMatrix = ref(null)
  const evidences = ref([])
  const evidenceTunerCellRef = ref(null)
  const articleUrl = ref(null)

  privateStore.undoStack.push(returnNonReactiveStore())
  privateStore.undoStackPointer = 0

  function resetStore() {
    hypotheses.value = []
    manualMatrix.value = []
    analysedMatrix.value = null
    evidences.value = []
    evidenceTunerCellRef.value = null
    articleUrl.value = null
  }

  function rawClone(value) {
    return structuredClone(toRaw(value))
  }

  function returnNonReactiveStore() {
    return {
      hypotheses: rawClone(hypotheses.value),
      manualMatrix: rawClone(manualMatrix.value),
      analysedMatrix: rawClone(analysedMatrix.value),
      evidences: rawClone(evidences.value),
      articleUrl: rawClone(articleUrl.value)
    }
  }

  function loadStore(store) {
    console.log(store.hypotheses)
    hypotheses.value = rawClone(store.hypotheses)
    manualMatrix.value = rawClone(store.manualMatrix)
    analysedMatrix.value = rawClone(store.analysedMatrix)
    evidences.value = rawClone(store.evidences)
    // We don't want to save this.
    evidenceTunerCellRef.value = null
    articleUrl.value = rawClone(store.articleUrl)
  }

  function pushUndoState() {
    // Wipe the future of the stack if there is any.
    privateStore.undoStack.splice(privateStore.undoStackPointer + 1)

    privateStore.undoStack.push(returnNonReactiveStore())
    privateStore.undoStackPointer++
  }

  function undo() {
    if (privateStore.undoStackPointer <= 0) {
      return
    }

    loadStore(privateStore.undoStack[--privateStore.undoStackPointer])
  }

  function redo() {
    if (privateStore.undoStack.length - 1 === privateStore.undoStackPointer) {
      return
    }

    loadStore(privateStore.undoStack[++privateStore.undoStackPointer])
  }

  function save() {
    const blob = new Blob(
      [
        JSON.stringify({
          fileSignature: 'f86929cf-00ae-49fd-93c6-a2fbcf6fc4d7',
          fileType: 'Impartial fact checker extension',
          version: 1,
          data: returnNonReactiveStore()
        })
      ],
      {
        type: 'application/json'
      }
    )
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download =
      new Date().toISOString().replace('T', '_').replace(/:/g, '-').replace(/\..+/, '') + '.arg'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  function load() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.arg'

    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()

      reader.onload = async (readerEvent) => {
        // I should probably catch any potential errors here or something ¯\_(ツ)_/¯
        const content = await JSON.parse(readerEvent.target.result)

        // Check that it's our unique file format
        if (content.fileSignature !== 'f86929cf-00ae-49fd-93c6-a2fbcf6fc4d7') {
          return
        }

        loadStore(content.data)
      }
      reader.readAsText(file)
    }

    input.click()
  }

  // Prioritise manualMatrix as these are the user's input values.
  const achMatrix = computed(() => {
    return manualMatrix.value
      .map((innerArr) => innerArr.slice())
      .map((x, i) => {
        return x.map((y, j) => {
          if (y != null) {
            return y
          }

          if (
            analysedMatrix.value !== null &&
            analysedMatrix.value[i] != null &&
            analysedMatrix.value[i][j] != null
          ) {
            return analysedMatrix.value[i][j]
          }

          return null
        })
      })
  })

  function addHypothesis(claim) {
    if (claim) {
      hypotheses.value.push(claim)
      manualMatrix.value.push(Array.from({ length: evidences.value.length }, () => undefined))
    }

    pushUndoState()
  }

  function deleteHypothesis(index) {
    hypotheses.value.splice(index, 1)
    manualMatrix.value.splice(index, 1)

    if (analysedMatrix.value !== null) {
      analysedMatrix.value.splice(index, 1)
    }

    pushUndoState()
  }

  function addEvidence(evidence, url) {
    if (evidence) {
      evidences.value.push({ text: evidence, url })
      manualMatrix.value.map((x) => x.push(undefined))
    }

    pushUndoState()
  }

  function deleteEvidence(index) {
    evidences.value.splice(index, 1)
    manualMatrix.value.map((x) => x.splice(index, 1))

    if (analysedMatrix.value !== null) {
      analysedMatrix.value.map((x) => x.splice(index, 1))
    }

    pushUndoState()
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
        resetStore()

        url = 'http://178.79.182.88:8080/get_claims/'

        // Get article text
        const tab = await getCurrentTab()
        const articleText = (await chrome.tabs.sendMessage(tab.id, { action: 'getArticleText' }))
          .text

        // These methods push to the first element of the list, so call them in reverse order.
        addSubheadingToTable()
        addHeadingToTable()

        console.log(articleText)

        articleUrl.value = tab.url

        options.body = JSON.stringify({
          text: articleText
        })

        return { url, options }
      },
      async afterFetch(ctx) {
        const get_claims = await ctx.response.json()

        hypotheses.value = [...hypotheses.value, ...get_claims.output.hypothesis]

        manualMatrix.value = Array.from({ length: hypotheses.value.length }, () => Array())

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

        pushUndoState()
        return ctx
      },
      updateDataOnError: true,
      onFetchError(ctx) {
        // ctx.data can be null when 5xx response
        if (ctx.data === null) {
          addHeadingToTable()
          addSubheadingToTable()
        }

        pushUndoState()
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

        analysedMatrix.value = analyse.output.full_scoring_matrix.map((x) =>
          x.map((y) => {
            if (y == -1000) {
              return y
            }

            if (y <= -0.75) {
              return -1
            } else if (y <= -0.25) {
              return -0.5
            } else if (y <= 0.25) {
              return 0
            } else if (y <= 0.75) {
              return 0.5
            } else {
              return 1
            }
          })
        )

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

        pushUndoState()
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
          full_scoring_matrix: achMatrix.value.map((x) =>
            x.map((y) => {
              if (y == null) {
                // The api expects this when the evidence isn't considered relevant,
                // so we'll use it if there's no value in the table for it.
                return -1000
              }
              return y
            })
          ),
          sources: evidences.value.map((e) => e.url ?? ''),
          article_url_link: articleUrl.value
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
    pushUndoState,
    undo,
    redo,
    save,
    load,
    addHypothesis,
    deleteHypothesis,
    addEvidence,
    deleteEvidence,
    analyseThisNewsArticle,
    analyzeEvidence,
    draftReport
  }
})
