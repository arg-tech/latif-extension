<script setup>
import { ref } from 'vue'
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg'
import { useStore } from '@/store'
import BaseButton from '@/components/BaseButton.vue'
import BaseModal from '@/components/BaseModal.vue'
import HelpButton from '@/components/AppHelpButton.vue'

const store = useStore()
const useFetchReturn = ref(null)
const modal = ref(null)
const showSourceCheckModal = ref(false)

function selectThisNewsArticle() {
  showSourceCheckModal.value = true
  useFetchReturn.value = store.selectThisNewsArticle()
}
</script>

<template>
  <div
    v-if="useFetchReturn?.error"
    class="mb-3 d-flex align-items-center alert alert-danger"
    role="alert"
  >
    <ExclamationTriangleFill class="flex-shrink-0 me-2" />
    Select This News Article failed: {{ useFetchReturn.error }}
  </div>

  <div class="d-flex gap-2">
    <BaseButton
      @click="selectThisNewsArticle"
      :loading="useFetchReturn?.isFetching"
      class="flex-grow-1"
    >
      Select This News Article

      <Teleport v-if="showSourceCheckModal" to="body">
        <BaseModal
          ref="modal"
          v-on="{ 'hidden.bs.modal': () => (showSourceCheckModal = false) }"
          @confirm="modal.hide()"
          title="Survey"
          confirmButtonText="Continue"
        >
          <label class="mb-2">Q1. Why are you selecting this news article?</label>
          <div class="input-group">
            <select class="form-select">
              <option selected>Choose...</option>
              <option value="1">Viral topic</option>
              <option value="2">Controversial content</option>
              <option value="3">Unreliable source</option>
              <option value="4">Other</option>
            </select>
          </div>
          <label class="mt-3 mb-2">Q2. How relevant do you think this news article is?</label>
          <div class="input-group">
            <select class="form-select">
              <option selected>Choose...</option>
              <option value="1">Very relevant/Current affair</option>
              <option value="2">Somewhat relevant</option>
              <option value="3">Not as relevant/Old news</option>
            </select>
          </div>
          <label class="mt-3 mb-2">
            Q3. Does the article contain any sensational language or emotional appeals?
          </label>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="option1" />
            <label class="form-check-label"> Yes </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="option2" />
            <label class="form-check-label"> No </label>
          </div>
        </BaseModal>
      </Teleport>
    </BaseButton>
    <HelpButton help-text="Automatically identifies the claims made in this article." />
  </div>
</template>
