<script setup>
import { inject, onMounted, ref, watch } from 'vue'

const responses = inject('responses')
const evidenceTunerCellRef = inject('evidenceTunerCellRef')

const dialCanvas = ref(null)

let canvas = null
let ctx = null
let centerX = null
let centerY = null

function getColor(value) {
  if (value < 50) {
    // Interpolate between red and yellow.
    const red = 255
    const green = Math.round(255 * (value / 50))
    return `rgb(${red},${green},0)`
  } else {
    // Interpolate between yellow and green.
    const green = 255
    const red = Math.round(255 * ((100 - value) / 50))
    return `rgb(${red},${green},0)`
  }
}

function drawDial() {
  const maxValue = 100
  const radius = 40
  const lineWidth = 10

  // Convert to 0-100 scale.
  const value =
    ((responses.analyze.output.full_scoring_matrix[evidenceTunerCellRef.value[1]][
      evidenceTunerCellRef.value[0]
    ] +
      1) /
      2) *
    100

  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw the outer circle.
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = '#ccc'
  ctx.stroke()
  ctx.closePath()

  const startAngle = -0.5 * Math.PI
  const endAngle = startAngle + (value / maxValue) * 2 * Math.PI
  const color = getColor(value)

  // Draw the filled arc.
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, startAngle, endAngle)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.stroke()
  ctx.closePath()
}

function getMousePosition(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

function handleMouseMove(event) {
  const pos = getMousePosition(event)
  const angle = Math.atan2(pos.y - centerY, pos.x - centerX) + 0.5 * Math.PI
  const normalizedAngle = (angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI)

  // Now update dial.
  // Convert back to -1 to 1 scale.
  responses.analyze.output.full_scoring_matrix[evidenceTunerCellRef.value[1]][
    evidenceTunerCellRef.value[0]
  ] = parseFloat((normalizedAngle * 2 - 1).toFixed(2))
  drawDial()
}

onMounted(() => {
  canvas = dialCanvas.value
  ctx = canvas.getContext('2d')

  centerX = canvas.width / 2
  centerY = canvas.height / 2

  let isMouseDown = false

  canvas.addEventListener('mousedown', () => {
    isMouseDown = true
    canvas.addEventListener('mousemove', handleMouseMove)
  })

  window.addEventListener('mouseup', () => {
    isMouseDown = false
    canvas.removeEventListener('mousemove', handleMouseMove)
  })

  canvas.addEventListener('mouseleave', () => {
    if (isMouseDown) {
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  })

  drawDial()
})

watch(evidenceTunerCellRef, () => {
  drawDial()
})
</script>

<template>
  <canvas ref="dialCanvas" width="100" height="100"></canvas>
</template>
