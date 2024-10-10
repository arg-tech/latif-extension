<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'
import FetchAlert from '@/components/AppButtonFetchAlert.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
// import HelpButton from '@/components/AppHelpButton.vue'

const store = useStore()
const useFetchReturn = ref(null)
const modal = ref(null)
const showSourceCheckModal = ref(false)

function analyseThisNewsArticle() {
  showSourceCheckModal.value = true
  useFetchReturn.value = store.analyseThisNewsArticle()
}
</script>

<template>
  <FetchAlert v-if="useFetchReturn?.error" class="mb-3">
    Analyse This News Article failed: {{ useFetchReturn.error }}
  </FetchAlert>

  <div class="container text-center fst-italic mb-2">
    Click the button to add your own claim in addition to those found automatically
  </div>
  <div class="d-flex gap-2">
    <BaseButton
      @click="analyseThisNewsArticle"
      :loading="useFetchReturn?.isFetching"
      class="flex-grow-1"
    >
      Analyse This News Article

      <BaseModal
        ref="modal"
        v-if="showSourceCheckModal"
        v-on="{ 'hidden.bs.modal': () => (showSourceCheckModal = false) }"
        @confirm="modal.hide()"
        title="Why are you selecting this news article?"
        confirmButtonText="Continue"
      >
        <label for="option1" class="form-label fw-semibold"> Popularity </label>
        <input type="range" class="form-range" id="customRange1" />
        <div class="d-flex justify-content-between">
          <p class="small-text text-start">Strongly disagree</p>
          <p class="small-text text-center">Neither disagree nor agree</p>
          <p class="small-text text-end">Strongly agree</p>
        </div>
        <label for="option2" class="form-label fw-semibold"> Relevance </label>
        <input type="range" class="form-range" id="customRange1" />
        <div class="d-flex justify-content-between">
          <p class="small-text text-start">Strongly disagree</p>
          <p class="small-text text-center">Neither disagree nor agree</p>
          <p class="small-text text-end">Strongly agree</p>
        </div>
        <label for="option3" class="form-label fw-semibold"> Familiarity </label>
        <input type="range" class="form-range" id="customRange1" />
        <div class="d-flex justify-content-between">
          <p class="small-text text-start">Strongly disagree</p>
          <p class="small-text text-center">Neither disagree nor agree</p>
          <p class="small-text text-end">Strongly agree</p>
        </div>
        <label for="option4" class="form-label fw-semibold"> Timeliness </label>
        <input type="range" class="form-range" id="customRange1" />
        <div class="d-flex justify-content-between">
          <p class="small-text text-start">Strongly disagree</p>
          <p class="small-text text-center">Neither disagree nor agree</p>
          <p class="small-text text-end">Strongly agree</p>
        </div>
        <label for="option5" class="form-label fw-semibold"> Suggested by readers </label>
        <input type="range" class="form-range" id="customRange1" />
        <div class="d-flex justify-content-between">
          <p class="small-text text-start">Strongly disagree</p>
          <p class="small-text text-center">Neither disagree nor agree</p>
          <p class="small-text text-end">Strongly agree</p>
        </div>
        <div>
          <label class="form-label fw-semibold" for="other"> Other </label>
          <textarea class="form-control" rows="3"></textarea>
        </div>
      </BaseModal>
    </BaseButton>
    <!-- <HelpButton help-text="Automatically identifies the claims made in this article." class="col" /> -->
  </div>
</template>

<style scoped>
.small-text {
  font-size: 12px;
}
</style>
