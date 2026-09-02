<template>
  <div>
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
        <v-icon class="mr-2">mdi-account-multiple</v-icon>
        Spelers
      </v-card-title>
    </v-card>

    <v-row v-if="spelers.length" dense>
      <v-col v-for="speler in spelers" :key="speler.lidNummer" cols="6" sm="4" md="3" lg="2">
        <v-card
          :to="{ name: 'speler-detail', params: { id: speler.lidNummer } }"
          elevation="2"
          rounded="lg"
          class="speler-card"
          hover
        >
          <v-card-text class="text-center py-5">
            <v-avatar color="green-darken-3" size="48" class="mb-2">
              <span class="text-subtitle-1 text-white">{{ speler.naam.charAt(0) }}</span>
            </v-avatar>
            <div class="font-weight-medium text-truncate">{{ speler.naam }}</div>
            <div class="text-caption text-grey">
              <span v-if="speler.gemiddelde !== null">Moy. {{ speler.gemiddelde }}</span>
              <span v-else class="text-grey-lighten-1">Geen data</span>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card v-else-if="!loading" elevation="2" rounded="lg">
      <div class="pa-8 text-center text-grey">
        <v-icon size="48" class="mb-2">mdi-account-off</v-icon>
        <div>Geen spelers gevonden.</div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const spelers = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const [ledenRes, seizoenenRes] = await Promise.all([
      axios.get('/api/leden'),
      axios.get('/api/spelers/seizoenen')
    ])

    const laatsteSeizoen = seizoenenRes.data[0]
    const { data: stats } = await axios.get('/api/spelers', { params: { seizoen: laatsteSeizoen } })
    const statsMap = new Map(stats.map(s => [s.spelerID, s.gemiddelde]))

    spelers.value = ledenRes.data.map(l => ({
      lidNummer: l.lidNummer,
      naam: l.schermnaam?.length ? l.schermnaam : `${l.voornaam} ${l.achternaam}`,
      gemiddelde: statsMap.has(l.lidNummer) ? statsMap.get(l.lidNummer) : null
    })).sort((a, b) => a.naam.localeCompare(b.naam))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.speler-card {
  text-decoration: none;
  height: 100%;
}
</style>
