<template>
  <span ref="tooltipElement" data-bs-toggle="tooltip" :data-bs-title="hypothesis">
    {{ hypothesis.slice(0, 10).trimEnd() }}...
  </span>
</template>

<script>
import * as bootstrap from 'bootstrap'

export default {
  props: ['hypothesis'],
  data() {
    return {
      tooltip: null
    }
  },
  mounted() {
    this.initTooltip()
  },
  beforeUpdate() {
    // Dispose of the tooltip before updating
    this.disposeTooltip()
  },
  updated() {
    // Reinitialize the tooltip after data updates
    this.initTooltip()
  },
  methods: {
    initTooltip() {
      if (this.$refs.tooltipElement) {
        this.tooltip = new bootstrap.Tooltip(this.$refs.tooltipElement)
      }
    },
    disposeTooltip() {
      if (this.tooltip) {
        this.tooltip.dispose()
        this.tooltip = null
      }
    }
  }
}
</script>
