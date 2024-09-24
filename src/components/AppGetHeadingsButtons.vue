<script setup>
import { ref } from 'vue'
import BaseButton from '@/components/BaseButton.vue'
import { getCurrentTab } from '@/utils'
import { useStore } from '@/store'

const store = useStore()

const addedHeading = ref(false)
const addedSubheading = ref(false)

async function addHeadingToTable() {
  addedHeading.value = true

  const tab = await getCurrentTab()

  const articleHeading = (await chrome.tabs.sendMessage(tab.id, { action: 'getHeading' })).text

  store.hypotheses.unshift(articleHeading)

  store.manualMatrix.unshift(Array())
}

async function addSubheadingToTable() {
  addedSubheading.value = true

  const tab = await getCurrentTab()

  const articleSubHeading = (await chrome.tabs.sendMessage(tab.id, { action: 'getSubheading' })).text

  store.hypotheses.unshift(articleSubHeading)

  store.manualMatrix.unshift(Array())
}
</script>

<template>
  <div class="d-flex gap-2">
    <BaseButton
      @click="addHeadingToTable"
      :loading="useFetchReturn?.isFetching"
      :disabled="addedHeading"
      class="flex-grow-1"
    >
      Add Heading
    </BaseButton>
    <BaseButton
      @click="addSubheadingToTable"
      :loading="useFetchReturn?.isFetching"
      :disabled="addedSubheading"
      class="flex-grow-1"
    >
      Add Subheading
    </BaseButton>
  </div>
</template>
