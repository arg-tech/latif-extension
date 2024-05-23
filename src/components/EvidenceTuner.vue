<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    type="range"
    list="values"
    min="-1"
    max="1"
    step="0.01"
  />
  <datalist id="values">
    <option value="-1" label="low"></option>
    <option value="0" label="medium"></option>
    <option value="1" label="high"></option>
  </datalist>
</template>

<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue']
}
</script>
