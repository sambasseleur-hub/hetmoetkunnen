<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
      <v-icon class="mr-2">mdi-account-group</v-icon>
      Spelersoverzicht
      <v-spacer />
      <v-select
        v-model="seizoen"
        :items="seizoenen"
        label="Seizoen"
        density="compact"
        hide-details
        clearable
        style="max-width: 160px"
        variant="outlined"
        base-color="white"
        color="white"
        class="text-white"
      />
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="spelers"
      :loading="loading"
      items-per-page="25"
      class="elevation-0"
    >
      <template #item.gewonnen="{ item }">
        {{ item.gewonnen }} / {{ item.aantalPartijen }}
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
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const spelers = ref([])
const seizoenen = ref([])
const seizoen = ref(null)
const loading = ref(false)

const headers = [
  { title: 'Naam', key: 'naam', sortable: true },
  { title: 'Partijen', key: 'aantalPartijen', sortable: true },
  { title: 'Gewonnen', key: 'gewonnen', sortable: true },
  { title: 'Caramboles', key: 'totaalCaramboles', sortable: true },
  { title: 'Te halen gem.', key: 'teHalenGemiddelde', sortable: true },
  { title: 'Gemiddelde', key: 'gemiddeldePartij', sortable: true },
  { title: 'Plus/Min', key: 'plusMin', sortable: true },
  { title: 'Hoogste serie', key: 'hoogsteSet', sortable: true }
]

async function loadSeizioenen() {
  const { data } = await axios.get('/api/spelers/seizoenen')
  seizoenen.value = data
}

async function loadSpelers() {
  loading.value = true
  try {
    const params = seizoen.value ? { seizoen: seizoen.value } : {}
    const { data } = await axios.get('/api/spelers', { params })
    spelers.value = data
  } finally {
    loading.value = false
  }
}

watch(seizoen, loadSpelers)

onMounted(async () => {
  await loadSeizioenen()
  await loadSpelers()
})
</script>
