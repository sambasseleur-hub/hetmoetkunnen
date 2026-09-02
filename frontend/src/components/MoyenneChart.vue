<template>
  <div style="height: 320px">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip
} from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip)

const props = defineProps({
  partijen: { type: Array, default: () => [] }
})

const LINE_COLOR = '#2e7d32'
const GRID_COLOR = '#e1e0d9'
const MUTED_TEXT = '#898781'

function formatDate(d) {
  return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const chartData = computed(() => ({
  labels: props.partijen.map(p => formatDate(p.datum)),
  datasets: [
    {
      data: props.partijen.map(p => p.gemiddelde),
      borderColor: LINE_COLOR,
      backgroundColor: LINE_COLOR,
      borderWidth: 2,
      pointRadius: props.partijen.length > 60 ? 0 : 4,
      pointHoverRadius: 5,
      pointBackgroundColor: '#fff',
      pointBorderColor: LINE_COLOR,
      pointBorderWidth: 2,
      tension: 0.15
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
        label: (ctx) => `Moy. ${ctx.parsed.y}`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: MUTED_TEXT, font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 10 }
    },
    y: {
      beginAtZero: true,
      grid: { color: GRID_COLOR },
      border: { display: false },
      ticks: { color: MUTED_TEXT, font: { size: 11 } }
    }
  }
}
</script>
