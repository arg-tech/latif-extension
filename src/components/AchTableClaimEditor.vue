<script setup>
import { defineEmits, defineProps, onMounted, ref } from 'vue'

defineExpose({
  confirmClaim
})

const props = defineProps(['initialValue'])
const emits = defineEmits(['claim'])

const claimText = ref(props.initialValue)
const inputElement = ref(null)

onMounted(() => {
  inputElement.value.focus()
})

function confirmClaim() {
  emits('claim', claimText.value)
}
</script>

<template>
  <form @submit.prevent="confirmClaim" class="d-grid gap-2">
    <textarea ref="inputElement" v-model="claimText" type="text" class="form-control" rows="4" />
  </form>
</template>
