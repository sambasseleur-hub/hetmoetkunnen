<template>
  <div>
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center flex-wrap ga-2">
        <v-btn icon="mdi-arrow-left" variant="text" color="white" size="small" :to="{ name: 'spelers' }" class="mr-2" />
        <v-icon class="mr-2">mdi-account</v-icon>
        {{ naam }}
        <v-spacer />
        <v-select
          v-model="periode"
          :items="periodes"
          label="Periode"
          density="compact"
          hide-details
          style="max-width: 180px"
          variant="outlined"
          base-color="white"
          color="white"
          class="text-white"
        />
      </v-card-title>

      <v-card-text class="pa-6">
        <v-row dense>
          <v-col cols="6" sm="3">
            <div class="stat-tile">
              <div class="stat-value">{{ huidigeMoyenne ?? '–' }}</div>
              <div class="stat-label">Huidige moyenne</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-tile">
              <div class="stat-value">{{ gefilterdePartijen.length }}</div>
              <div class="stat-label">Partijen in periode</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-tile">
              <div class="stat-value">{{ hoogsteMoyenne ?? '–' }}</div>
              <div class="stat-label">Hoogste moyenne</div>
            </div>
          </v-col>
          <v-col cols="6" sm="3">
            <div class="stat-tile">
              <div class="stat-value">{{ partijen.length }}</div>
              <div class="stat-label">Partijen totaal</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card elevation="2" rounded="lg">
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center">
        <v-icon class="mr-2" color="green-darken-3">mdi-chart-line</v-icon>
        Moyenne per partij
      </v-card-title>
      <v-card-text>
        <MoyenneChart v-if="gefilterdePartijen.length" :partijen="gefilterdePartijen" />
        <div v-else class="pa-8 text-center text-grey">
          <v-icon size="48" class="mb-2">mdi-chart-line-variant</v-icon>
          <div>Geen partijen in deze periode.</div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import MoyenneChart from '../components/MoyenneChart.vue'

const route = useRoute()
const naam = ref('')
const partijen = ref([])
const huidigeMoyenne = ref(null)
const periode = ref('jaar')

const periodes = [
  { title: 'Laatste week', value: 'week' },
  { title: 'Laatste maand', value: 'maand' },
  { title: 'Laatste 3 maanden', value: 'kwartaal' },
  { title: 'Laatste jaar', value: 'jaar' },
  { title: 'Alles', value: 'alles' }
]

const gefilterdePartijen = computed(() => {
  if (periode.value === 'alles') return partijen.value

  const nu = new Date()
  const vanaf = new Date(nu)
  if (periode.value === 'week') vanaf.setDate(nu.getDate() - 7)
  else if (periode.value === 'maand') vanaf.setMonth(nu.getMonth() - 1)
  else if (periode.value === 'kwartaal') vanaf.setMonth(nu.getMonth() - 3)
  else if (periode.value === 'jaar') vanaf.setFullYear(nu.getFullYear() - 1)

  return partijen.value.filter(p => new Date(p.datum) >= vanaf)
})

const hoogsteMoyenne = computed(() => {
  if (!gefilterdePartijen.value.length) return null
  return Math.max(...gefilterdePartijen.value.map(p => p.gemiddelde)).toFixed(2)
})

onMounted(async () => {
  const lidNummer = parseInt(route.params.id)

  const [ledenRes, partijenRes, seizoenenRes] = await Promise.all([
    axios.get('/api/leden'),
    axios.get(`/api/spelers/${lidNummer}/partijen`),
    axios.get('/api/spelers/seizoenen')
  ])

  const lid = ledenRes.data.find(l => l.lidNummer === lidNummer)
  naam.value = lid ? (lid.schermnaam?.length ? lid.schermnaam : `${lid.voornaam} ${lid.achternaam}`) : 'Onbekend'

  partijen.value = [...partijenRes.data]
    .sort((a, b) => new Date(a.datum) - new Date(b.datum))

  const laatsteSeizoen = seizoenenRes.data[0]
  if (laatsteSeizoen) {
    const { data: stats } = await axios.get('/api/spelers', { params: { seizoen: laatsteSeizoen } })
    const eigenStats = stats.find(s => s.spelerID === lidNummer)
    huidigeMoyenne.value = eigenStats ? eigenStats.gemiddelde : null
  }
})
</script>

<style scoped>
.stat-tile {
  text-align: center;
  padding: 8px;
}
.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}
.stat-label {
  font-size: 0.75rem;
  color: #757575;
  margin-top: 2px;
}
</style>
