<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
      <v-icon class="mr-2">mdi-account-multiple</v-icon>
      Spelers
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="spelers"
      :loading="loading"
      items-per-page="30"
      density="comfortable"
      class="elevation-0"
      @click:row="(_e, { item }) => goToDetail(item)"
    >
      <template #item.naam="{ item }">
        <span class="font-weight-medium">{{ item.naam }}</span>
      </template>

      <template #item.gemiddelde="{ item }">
        <span v-if="item.gemiddelde !== null">{{ item.gemiddelde }}</span>
        <span v-else class="text-grey-lighten-1">–</span>
      </template>

      <template #item.actions="{ item }">
        <v-icon size="18" color="grey">mdi-chevron-right</v-icon>
      </template>

      <template #no-data>
        <div class="pa-8 text-center text-grey">
          <v-icon size="48" class="mb-2">mdi-account-off</v-icon>
          <div>Geen spelers gevonden.</div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const spelers = ref([])
const loading = ref(false)

const headers = [
  { title: 'Naam', key: 'naam' },
  { title: 'Huidige moyenne', key: 'gemiddelde', align: 'end' },
  { title: '', key: 'actions', sortable: false, align: 'end', width: 40 }
]

function goToDetail(item) {
  router.push({ name: 'speler-detail', params: { id: item.lidNummer } })
}

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
:deep(tbody tr) {
  cursor: pointer;
}
</style>
