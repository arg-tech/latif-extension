<template>
  <canvas ref="dialCanvas" width="100" height="100"></canvas>
</template>

<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  mounted() {
    const canvas = this.$refs.dialCanvas;
    const ctx = canvas.getContext('2d');

    let value = (this.modelValue + 1) / 2 * 100; // Convert to 0-100 scale
    const minValue = 0;
    const maxValue = 100;
    const radius = 40;
    const lineWidth = 10;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const getColor = (value) => {
      if (value < 50) {
        // Interpolate between red and yellow
        const red = 255;
        const green = Math.round(255 * (value / 50));
        return `rgb(${red},${green},0)`;
      } else {
        // Interpolate between yellow and green
        const green = 255;
        const red = Math.round(255 * ((100 - value) / 50));
        return `rgb(${red},${green},0)`;
      }
    };

    const drawDial = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      ctx.closePath();

      const startAngle = -0.5 * Math.PI;
      const endAngle = startAngle + (value / maxValue) * 2 * Math.PI;
      const color = getColor(value);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.closePath();
    };

    const updateDial = (newValue) => {
      value = Math.min(Math.max(newValue, minValue), maxValue);
      drawDial();
      this.$emit('update:modelValue', parseFloat((value / 50 - 1).toFixed(2))); // Convert back to -1 to 1 scale
    };

    const getMousePosition = (event) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    };

    const handleMouseMove = (event) => {
      const pos = getMousePosition(event);
      const angle = Math.atan2(pos.y - centerY, pos.x - centerX) + 0.5 * Math.PI;
      const normalizedAngle = (angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI);
      updateDial(normalizedAngle * maxValue);
    };

    let isMouseDown = false;

    canvas.addEventListener('mousedown', () => {
      isMouseDown = true;
      canvas.addEventListener('mousemove', handleMouseMove);
    });

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
      canvas.removeEventListener('mousemove', handleMouseMove);
    });

    canvas.addEventListener('mouseleave', () => {
      if (isMouseDown) {
        canvas.removeEventListener('mousemove', handleMouseMove);
      }
    });

    drawDial();

    // Attach drawDial function to the instance for use in the watch property
    this.drawDial = drawDial;
  },
  watch: {
    modelValue(newValue) {
      const canvas = this.$refs.dialCanvas;
      const ctx = canvas.getContext('2d');
      let value = (newValue + 1) / 2 * 100; // Convert to 0-100 scale

      const getColor = (value) => {
        if (value < 50) {
          // Interpolate between red and yellow
          const red = 255;
          const green = Math.round(255 * (value / 50));
          return `rgb(${red},${green},0)`;
        } else {
          // Interpolate between yellow and green
          const green = 255;
          const red = Math.round(255 * ((100 - value) / 50));
          return `rgb(${red},${green},0)`;
        }
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const radius = 40;
      const lineWidth = 10;
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      const startAngle = -0.5 * Math.PI;
      const endAngle = startAngle + (value / 100) * 2 * Math.PI;
      const color = getColor(value);

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = '#ccc';
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.closePath();
    }
  }
}
</script>
