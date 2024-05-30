<script setup>
defineProps({ loading: Boolean })
</script>

<template>
  <button type="button" :disabled="loading" class="btn btn-primary">
    <slot />
    <span v-if="loading" aria-hidden="true" class="spinner-border spinner-border-sm ms-2"></span>
  </button>
</template>
