<template>
  <div style="height: 220px">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from 'chart.js'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps({
  avonden: { type: Array, default: () => [] }
})

const BAR_COLOR = '#2e7d32'
const GRID_COLOR = '#e1e0d9'
const MUTED_TEXT = '#898781'

function formatDate(d) {
  return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })
}

const chartData = computed(() => ({
  labels: props.avonden.map(a => formatDate(a.datum)),
  datasets: [
    {
      data: props.avonden.map(a => a.aantalSpelers),
      backgroundColor: BAR_COLOR,
      borderRadius: 4,
      barThickness: Math.min(24, 400 / Math.max(props.avonden.length, 1)),
      maxBarThickness: 24
    }
  ]
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#0b0b0b',
      padding: 8,
      cornerRadius: 6,
      displayColors: false,
      callbacks: {
        label: (ctx) => `${ctx.parsed.y} spelers`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: MUTED_TEXT, font: { size: 11 } }
    },
    y: {
      beginAtZero: true,
      grid: { color: GRID_COLOR },
      border: { display: false },
      ticks: { color: MUTED_TEXT, font: { size: 11 }, precision: 0 }
    }
  }
}
</script>
