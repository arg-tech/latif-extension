import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export const useStore = defineStore('store', () => {
  const responses = reactive({ get_claims: null, analyze: null })
  const loading = reactive({ extractClaims: false, analyzeEvidence: false, generateReport: false })
  const evidences = ref([])
  const evidenceTunerCellRef = ref(null)
  const extractedClaimsUrl = ref(null)

  return { responses, loading, evidences, evidenceTunerCellRef, extractedClaimsUrl }
})
