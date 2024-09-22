<script setup>
import { ref } from 'vue'
import { useStore } from '@/store'
import FetchAlert from '@/components/AppButtonFetchAlert.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import HelpButton from '@/components/AppHelpButton.vue'

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

  <div class="d-flex gap-2">
    <BaseButton
      @click="analyseThisNewsArticle"
      :loading="useFetchReturn?.isFetching"
      class="flex-grow-1"
    >
      Analyse This News Article

      <Teleport v-if="showSourceCheckModal" to="body">
        <BaseModal
          ref="modal"
          v-on="{ 'hidden.bs.modal': () => (showSourceCheckModal = false) }"
          @confirm="modal.hide()"
          title="Why are you selecting this news article?"
          confirmButtonText="Continue"
        >
          <label for="option1" class="form-label fw-semibold"> Reach of the claim </label>
          <input type="range" class="form-range" id="customRange1" />
          <div class="d-flex justify-content-between">
            <p class="fs-6">Low</p>
            <p>Medium</p>
            <p class="fs-6">High</p>
          </div>
          <label for="option2" class="form-label fw-semibold"> Importance of the claim </label>
          <input type="range" class="form-range" id="customRange1" />
          <div class="d-flex justify-content-between">
            <p class="fs-6">Low</p>
            <p>Medium</p>
            <p class="fs-6">High</p>
          </div>
          <label for="option3" class="form-label fw-semibold"> Familiarity </label>
          <input type="range" class="form-range" id="customRange1" />
          <div class="d-flex justify-content-between">
            <p>Low</p>
            <p>Medium</p>
            <p>High</p>
          </div>
          <label for="option4" class="form-label fw-semibold"> Timeliness </label>
          <input type="range" class="form-range" id="customRange1" />
          <div class="d-flex justify-content-between">
            <p>Low</p>
            <p>Medium</p>
            <p>High</p>
          </div>
          <label for="option5" class="form-label fw-semibold"> Suggested by readers </label>
          <input type="range" class="form-range" id="customRange1" />
          <div class="d-flex justify-content-between">
            <p>No</p>
            <p>Maybe</p>
            <p>Yes</p>
          </div>
          <div class="form-check mt-2">
            <input
              class="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="idk"
            />
            <label class="form-check-label fw-semibold" for="idk"> I don't know </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="flexRadioDefault"
              id="other"
            />
            <label class="form-check-label fw-semibold" for="other"> Other </label>
          </div>
        </BaseModal>
      </Teleport>
    </BaseButton>
    <HelpButton help-text="Automatically identifies the claims made in this article." />
  </div>
</template>
