<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useStore } from '@/store'
import InfoIcon from 'bootstrap-icons/icons/info-lg.svg'
import FetchAlert from '@/components/AppButtonFetchAlert.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import * as bootstrap from 'bootstrap'
// import HelpButton from '@/components/AppHelpButton.vue'

const store = useStore()
const useFetchReturn = ref(null)
const showSurveyModal = ref(false)
const warningModal = ref(null)
const showWarningModal = ref(false)
const tooltip = ref(null)
const tooltipElement = ref(null)

onMounted(() => {
  initTooltip()
})

onUnmounted(() => {
  // Dispose of the tooltip before unmounting, stops tooltip staying after item is deleted.
  disposeTooltip()
})

function initTooltip() {
  if (tooltipElement.value) {
    tooltip.value = new bootstrap.Tooltip(tooltipElement.value.$el)
  }
}

function disposeTooltip() {
  if (tooltip.value) {
    tooltip.value.dispose()
    tooltip.value = null
  }
}

function handleAnalyseButton() {
  // Show warning if an article is already being analysed.
  if (store.hypotheses.length > 0) {
    showWarningModal.value = true
    return
  }

  showSurveyModal.value = true
  useFetchReturn.value = store.analyseThisNewsArticle()
}

function handleWarningModalConfirm() {
  showSurveyModal.value = true
  useFetchReturn.value = store.analyseThisNewsArticle()
  warningModal.value.hide()
}
</script>

<template>
  <FetchAlert v-if="useFetchReturn?.error" class="mb-3">
    Analyse This News Article failed: {{ useFetchReturn.error }}
  </FetchAlert>

  <BaseButton
    ref="tooltipElement"
    @click="handleAnalyseButton"
    :loading="useFetchReturn?.isFetching"
    class="flex-grow-1"
    data-bs-toggle="tooltip"
    data-bs-title="Automatically extract claims from the news article"
  >
    Analyse This News Article

    <BaseModal
      ref="warningModal"
      v-if="showWarningModal"
      v-on="{ 'hidden.bs.modal': () => (showWarningModal = false) }"
      @confirm="handleWarningModalConfirm"
      title="Confirm Action?"
      confirmButtonText="Continue anyway"
    >
      If you continue, the claims will be extracted from this webpage, and your previous work will
      be lost. Do you wish to continue?
    </BaseModal>

    <BaseModal
      v-model="showSurveyModal"
      @confirm="showSurveyModal = false"
      title="Why are you selecting this news article?"
      confirmButtonText="Continue"
    >
      <div class="d-flex align-items-center alert alert-secondary" role="alert">
        <InfoIcon class="flex-shrink-0 me-3" />
        The International Fact-Checking Network recommends selecting news articles according to
        their relevance and reach.
      </div>
      <hr />
      <label for="option1" class="form-label fw-semibold"> Popularity </label>
      <div class="likert d-flex justify-content-between mb-3">
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_disagree" />
          <label class="small-text">Strongly <br />disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="disagree" />
          <label class="small-text">Disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="neutral" />
          <label class="small-text">Neutral</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="agree" />
          <label class="small-text">Agree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_agree" />
          <label class="small-text">Strongly <br />agree</label>
        </div>
      </div>

      <hr />

      <label for="option2" class="form-label fw-semibold"> Relevance </label>
      <div class="likert d-flex justify-content-between mb-3">
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_disagree" />
          <label class="small-text">Strongly <br />disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="disagree" />
          <label class="small-text">Disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="neutral" />
          <label class="small-text">Neutral</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="agree" />
          <label class="small-text">Agree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_agree" />
          <label class="small-text">Strongly <br />agree</label>
        </div>
      </div>

      <hr />

      <label for="option3" class="form-label fw-semibold"> Familiarity </label>
      <div class="likert d-flex justify-content-between mb-3">
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_disagree" />
          <label class="small-text">Strongly <br />disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="disagree" />
          <label class="small-text">Disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="neutral" />
          <label class="small-text">Neutral</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="agree" />
          <label class="small-text">Agree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_agree" />
          <label class="small-text">Strongly <br />agree</label>
        </div>
      </div>

      <hr />

      <label for="option4" class="form-label fw-semibold"> Timeliness </label>
      <div class="likert d-flex justify-content-between mb-3">
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_disagree" />
          <label class="small-text">Strongly <br />disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="disagree" />
          <label class="small-text">Disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="neutral" />
          <label class="small-text">Neutral</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="agree" />
          <label class="small-text">Agree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_agree" />
          <label class="small-text">Strongly <br />agree</label>
        </div>
      </div>

      <hr />

      <label for="option5" class="form-label fw-semibold"> Suggested by readers </label>
      <div class="likert d-flex justify-content-between mb-3">
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_disagree" />
          <label class="small-text">Strongly <br />disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="disagree" />
          <label class="small-text">Disagree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="neutral" />
          <label class="small-text">Neutral</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="agree" />
          <label class="small-text">Agree</label>
        </div>
        <div class="d-flex flex-column align-items-center">
          <input type="radio" name="likert" value="strongly_agree" />
          <label class="small-text">Strongly <br />agree</label>
        </div>
      </div>

      <hr />

      <div>
        <label class="form-label fw-semibold" for="other"> Other </label>
        <textarea class="form-control" rows="3"></textarea>
      </div>
    </BaseModal>
  </BaseButton>
</template>

<style scoped>
.small-text {
  font-size: 12px;
}
/* 
.likert {
  border-bottom:2px solid #efefef;
} */
</style>
