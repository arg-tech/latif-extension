<script setup>
import ExclamationTriangleFill from 'bootstrap-icons/icons/exclamation-triangle-fill.svg'
</script>

<template>
  <div class="d-flex align-items-center alert alert-danger" role="alert">
    <ExclamationTriangleFill class="flex-shrink-0 me-2" />
    <slot />
  </div>
</template>
