<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center flex-wrap gap-2">
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
      <v-select
        v-model="week"
        :items="weken"
        label="Week"
        density="compact"
        hide-details
        clearable
        :disabled="!weken.length"
        style="max-width: 120px"
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
      hover
      @click:row="(_, { item }) => openDetail(item)"
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

  <!-- Detail dialog -->
  <v-dialog v-model="dialog" max-width="900">
    <v-card v-if="selected">
      <v-card-title class="bg-green-darken-3 text-white pa-4 d-flex align-center">
        <v-icon class="mr-2">mdi-account</v-icon>
        {{ selected.naam }}
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="white" @click="dialog = false" />
      </v-card-title>

      <v-card-text class="pa-0">
        <v-data-table
          :headers="detailHeaders"
          :items="partijen"
          :loading="detailLoading"
          items-per-page="15"
          class="elevation-0"
        >
          <template #item.datum="{ item }">
            {{ formatDate(item.datum) }}
          </template>

          <template #item.plusMin="{ item }">
            <span :class="item.plusMin > 0 ? 'text-green-darken-2' : item.plusMin < 0 ? 'text-red' : ''">
              {{ item.plusMin > 0 ? '+' : '' }}{{ item.plusMin }}
            </span>
          </template>

          <template #no-data>
            <div class="pa-6 text-center text-grey">Geen partijen gevonden.</div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const spelers = ref([])
const seizoenen = ref([])
const weken = ref([])
const seizoen = ref(null)
const week = ref(null)
const loading = ref(false)

const dialog = ref(false)
const selected = ref(null)
const partijen = ref([])
const detailLoading = ref(false)

const headers = [
  { title: 'Naam', key: 'naam', sortable: true },
  { title: 'Partijen', key: 'aantalPartijen', sortable: true },
  { title: 'Gewonnen', key: 'gewonnen', sortable: true },
  { title: 'Caramboles', key: 'totaalCaramboles', sortable: true },
  { title: 'Beurten', key: 'beurten', sortable: true },
  { title: 'Te halen gem.', key: 'teHalenGemiddelde', sortable: true },
  { title: 'Gemiddelde', key: 'gemiddeldePartij', sortable: true },
  { title: 'Plus/Min', key: 'plusMin', sortable: true },
  { title: 'Hoogste serie', key: 'hoogsteSet', sortable: true }
]

const detailHeaders = [
  { title: 'Datum', key: 'datum', sortable: true },
  { title: 'Tegenstander', key: 'tegenstander', sortable: true },
  { title: 'Caramboles', key: 'caramboles', sortable: true },
  { title: 'Te halen', key: 'aantalCaramboles', sortable: true },
  { title: 'Beurten', key: 'beurten', sortable: true },
  { title: 'Gemiddelde', key: 'gemiddelde', sortable: true },
  { title: 'Te halen gem.', key: 'teHalenGemiddelde', sortable: true },
  { title: 'Plus/Min', key: 'plusMin', sortable: true },
  { title: 'Hoogste serie', key: 'hoogsteSet', sortable: true }
]

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function openDetail(speler) {
  selected.value = speler
  dialog.value = true
  partijen.value = []
  detailLoading.value = true
  try {
    const params = {}
    if (seizoen.value) params.seizoen = seizoen.value
    if (week.value) params.week = week.value
    const { data } = await axios.get(`/api/spelers/${speler.spelerID}/partijen`, { params })
    partijen.value = data
  } finally {
    detailLoading.value = false
  }
}

async function loadSeizioenen() {
  const { data } = await axios.get('/api/spelers/seizoenen')
  seizoenen.value = data
}

async function loadWeken() {
  const params = seizoen.value ? { seizoen: seizoen.value } : {}
  const { data } = await axios.get('/api/spelers/weken', { params })
  weken.value = data
}

async function loadSpelers() {
  loading.value = true
  try {
    const params = {}
    if (seizoen.value) params.seizoen = seizoen.value
    if (week.value) params.week = week.value
    const { data } = await axios.get('/api/spelers', { params })
    spelers.value = data
  } finally {
    loading.value = false
  }
}

watch(seizoen, async () => {
  week.value = null
  await loadWeken()
  await loadSpelers()
})

watch(week, loadSpelers)

onMounted(async () => {
  await loadSeizioenen()
  await loadWeken()
  await loadSpelers()
})
</script>
