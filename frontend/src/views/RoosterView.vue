<template>
  <div>
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center flex-wrap gap-2">
        <v-icon class="mr-2">mdi-podium</v-icon>
        Rooster
        <v-spacer />
        <v-select
          v-model="seizoen"
          :items="seizoenItems"
          label="Seizoen"
          density="compact"
          hide-details
          style="max-width: 220px"
          variant="outlined"
          base-color="white"
          color="white"
          class="text-white"
        />
      </v-card-title>
      <v-card-subtitle v-if="vorigSeizoenLabel" class="bg-green-darken-3 text-white pb-3" style="opacity: 0.85">
        Vorig rooster: {{ vorigSeizoenLabel }}
      </v-card-subtitle>

      <v-card-text class="pa-6">
        <v-row dense>
          <v-col v-for="tile in tiles" :key="tile.label" cols="6" sm="3">
            <div class="stat-tile">
              <v-icon :icon="tile.icon" size="20" color="green-darken-3" class="mb-1" />
              <div class="stat-value">{{ tile.value }}</div>
              <div class="stat-label">{{ tile.label }}</div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center flex-wrap">
        <v-icon class="mr-2" color="green-darken-3">mdi-format-list-numbered</v-icon>
        Klassement
        <v-spacer />
        <div v-if="movers.omhoog || movers.omlaag" class="d-flex ga-2">
          <v-chip size="small" color="green-darken-2" variant="flat" prepend-icon="mdi-arrow-up-bold">
            {{ movers.omhoog }}
          </v-chip>
          <v-chip size="small" color="red-darken-1" variant="flat" prepend-icon="mdi-arrow-down-bold">
            {{ movers.omlaag }}
          </v-chip>
        </div>
      </v-card-title>

      <v-data-table
        :headers="headers"
        :items="spelersWeergave"
        :loading="loading"
        items-per-page="30"
        density="comfortable"
        class="elevation-0 rooster-table"
        item-value="spelerID"
        :row-props="rowProps"
      >
        <template #item.rank="{ item }">
          <template v-if="item.gekwalificeerd">
            <v-icon v-if="rankOf(item) === 1" color="amber-darken-2" size="20">mdi-medal</v-icon>
            <v-icon v-else-if="rankOf(item) === 2" color="blue-grey-lighten-1" size="20">mdi-medal</v-icon>
            <v-icon v-else-if="rankOf(item) === 3" color="brown-lighten-1" size="20">mdi-medal</v-icon>
            <span v-else class="rank-number">{{ rankOf(item) }}</span>
          </template>
          <span v-else class="rank-number text-grey-lighten-1">–</span>
        </template>

        <template #item.naam="{ item }">
          <span class="font-weight-medium">{{ item.naam }}</span>
        </template>

        <template #item.clubKampioen="{ item }">
          <span v-if="item.clubKampioen" class="trophy-icons">
            <v-icon v-for="n in item.clubKampioen" :key="n" size="16" color="amber-darken-2">mdi-star</v-icon>
          </span>
          <span v-else class="text-grey-lighten-1">–</span>
        </template>

        <template #item.omeJaapKampioen="{ item }">
          <span v-if="item.omeJaapKampioen" class="trophy-icons">
            <v-icon v-for="n in item.omeJaapKampioen" :key="n" size="16" color="amber-darken-2">mdi-trophy</v-icon>
          </span>
          <span v-else class="text-grey-lighten-1">–</span>
        </template>

        <template #item.record="{ item }">
          <span class="text-green-darken-2">{{ item.gewonnen }}</span>
          <span class="text-grey"> / {{ item.gelijk }} / </span>
          <span class="text-red-darken-1">{{ item.verloren }}</span>
        </template>

        <template #item.toekomstCar="{ item }">
          <span :class="toekomstClass(item)">{{ item.toekomstCar }}</span>
        </template>

        <template #item.toekomstCarAfgerond="{ item }">
          <span :class="toekomstClass(item)">{{ item.toekomstCarAfgerond }}</span>
        </template>

        <template #item.toekomstMoy="{ item }">
          <span :class="toekomstClass(item)">{{ item.toekomstMoy }}</span>
        </template>

        <template #item.plusMin="{ item }">
          <v-chip
            :color="item.plusMin > 0 ? 'green-darken-2' : item.plusMin < 0 ? 'red-darken-1' : 'grey'"
            variant="flat"
            size="small"
          >
            {{ item.plusMin > 0 ? '+' : '' }}{{ item.plusMin }}%
          </v-chip>
        </template>

        <template #no-data>
          <div class="pa-8 text-center text-grey">
            <v-icon size="48" class="mb-2">mdi-account-off</v-icon>
            <div>Geen gegevens voor dit seizoen.</div>
          </div>
        </template>
      </v-data-table>

      <div class="text-caption text-grey px-4 pb-3">
        Minimaal {{ MIN_PARTIJEN }} partijen om mee te tellen voor de ranking.
      </div>
    </v-card>

    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center">
        <v-icon class="mr-2" color="green-darken-3">mdi-chart-bar</v-icon>
        Opkomst per speelavond
      </v-card-title>
      <v-card-text>
        <OpkomstChart :avonden="avonden" />
      </v-card-text>
    </v-card>

    <v-card elevation="2" rounded="lg">
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center">
        <v-icon class="mr-2" color="green-darken-3">mdi-trophy-outline</v-icon>
        Hoogste Serie
      </v-card-title>

      <div class="table-scroll">
        <v-table density="comfortable" class="hs-table">
          <thead>
            <tr>
              <th rowspan="2" class="align-bottom">#</th>
              <th rowspan="2" class="align-bottom">Naam</th>
              <th v-if="!mobile" rowspan="2" class="align-bottom text-end">Car.</th>
              <th colspan="3" class="text-center hs-group-header">Dit seizoen</th>
              <th v-if="!mobile" colspan="3" class="text-center hs-group-header">Alle roosters</th>
            </tr>
            <tr>
              <th class="text-end">HS</th>
              <th class="text-end">HS%</th>
              <th class="text-center">Was</th>
              <template v-if="!mobile">
                <th class="text-end">HS</th>
                <th>Gemaakt op</th>
                <th>Laatste keer</th>
              </template>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in hoogsteSerie" :key="s.spelerID">
              <td>{{ s.rank }}</td>
              <td class="font-weight-medium">{{ s.naam }}</td>
              <td v-if="!mobile" class="text-end">{{ s.car }}</td>
              <td class="text-end">{{ s.hsSeizoen }}</td>
              <td class="text-end">{{ s.hsPercent }}%</td>
              <td class="text-center">
                <span v-if="s.was > 0" class="text-green-darken-2">
                  <v-icon size="14">mdi-arrow-up-bold</v-icon>{{ s.was }}
                </span>
                <span v-else-if="s.was < 0" class="text-red-darken-1">
                  <v-icon size="14">mdi-arrow-down-bold</v-icon>{{ Math.abs(s.was) }}
                </span>
                <span v-else class="text-grey-lighten-1">–</span>
              </td>
              <template v-if="!mobile">
                <td class="text-end">{{ s.hsAlleTijden ?? '–' }}</td>
                <td>{{ formatDate(s.gemaaktOp) }}</td>
                <td>{{ s.laatsteKeer ? formatDate(s.laatsteKeer) : '–' }}</td>
              </template>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div v-if="!hoogsteSerieLoading && !hoogsteSerie.length" class="pa-8 text-center text-grey">
        <v-icon size="48" class="mb-2">mdi-account-off</v-icon>
        <div>Geen gegevens voor dit seizoen.</div>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useDisplay } from 'vuetify'
import axios from 'axios'
import OpkomstChart from '../components/OpkomstChart.vue'
import { seizoenItems as toSeizoenItems, seizoenLabel } from '../utils/seizoen'

const { mobile } = useDisplay()

const MIN_PARTIJEN = 6

const seizoenen = ref([])
const seizoenItems = computed(() => toSeizoenItems(seizoenen.value))
const seizoen = ref(null)
const spelers = ref([])
const spelersVorig = ref([])
const avonden = ref([])
const hoogsteSerie = ref([])
const loading = ref(false)
const hoogsteSerieLoading = ref(false)

const desktopHeaders = [
  { title: '#', key: 'rank', sortable: false, width: 56 },
  { title: 'Naam', key: 'naam', sortable: false },
  { title: 'Club', key: 'clubKampioen', sortable: false, align: 'center', width: 60 },
  { title: 'Ome Jaap', key: 'omeJaapKampioen', sortable: false, align: 'center', width: 60 },
  { title: 'Partijen', key: 'aantalPartijen', sortable: false, align: 'end' },
  { title: 'Car.', key: 'totaalCaramboles', sortable: false, align: 'end' },
  { title: 'Beurten', key: 'beurten', sortable: false, align: 'end' },
  { title: 'Moy.', key: 'gemiddelde', sortable: false, align: 'end' },
  { title: 'Toekomst Car.', key: 'toekomstCar', sortable: false, align: 'end' },
  { title: 'Afgerond', key: 'toekomstCarAfgerond', sortable: false, align: 'end' },
  { title: 'Toekomst Moy.', key: 'toekomstMoy', sortable: false, align: 'end' },
  { title: 'W / G / V', key: 'record', sortable: false, align: 'center' },
  { title: 'Resultaat', key: 'plusMin', sortable: false, align: 'end' }
]

const mobileHeaders = [
  { title: '#', key: 'rank', sortable: false, width: 32 },
  { title: 'Naam', key: 'naam', sortable: false },
  { title: 'Partijen', key: 'aantalPartijen', sortable: false, align: 'end' },
  { title: 'Moy.', key: 'gemiddelde', sortable: false, align: 'end' },
  { title: 'T. Car.', key: 'toekomstCar', sortable: false, align: 'end' },
  { title: 'W / G / V', key: 'record', sortable: false, align: 'center' },
  { title: 'Resultaat', key: 'plusMin', sortable: false, align: 'end' }
]

const headers = computed(() => mobile.value ? mobileHeaders : desktopHeaders)

function formatDate(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const rankMap = computed(() => {
  const map = new Map()
  let rank = 0
  for (const s of spelers.value) {
    if (s.gekwalificeerd) map.set(s.spelerID, ++rank)
  }
  return map
})

function rankOf(item) {
  return rankMap.value.get(item.spelerID)
}

function rowProps({ item }) {
  return item.gekwalificeerd ? {} : { class: 'text-grey' }
}

function toekomstClass(item) {
  if (item.toekomstMoy > item.teHalenGemiddelde) return 'text-green-darken-2'
  if (item.toekomstMoy < item.teHalenGemiddelde) return 'text-red-darken-1'
  return ''
}

const vorigSeizoen = computed(() => {
  if (!seizoen.value || !seizoenen.value.length) return null
  const idx = seizoenen.value.indexOf(seizoen.value)
  return idx >= 0 && idx < seizoenen.value.length - 1 ? seizoenen.value[idx + 1] : null
})

const vorigSeizoenLabel = computed(() => vorigSeizoen.value ? seizoenLabel(vorigSeizoen.value) : null)

const BEURTEN_PER_PARTIJ = 20

const vorigPlusMinMap = computed(() => new Map(spelersVorig.value.map(s => [s.spelerID, s.plusMin])))
const vorigGemiddeldeMap = computed(() => new Map(spelersVorig.value.map(s => [s.spelerID, s.gemiddelde])))

const spelersWeergave = computed(() => spelers.value.map(s => {
  const heeftVorig = vorigPlusMinMap.value.has(s.spelerID)
  const plusMinVorig = heeftVorig ? vorigPlusMinMap.value.get(s.spelerID) : null
  let res = null
  if (heeftVorig) {
    res = s.plusMin > plusMinVorig ? 'up' : s.plusMin < plusMinVorig ? 'down' : 'equal'
  }

  const gemiddeldeVorig = vorigGemiddeldeMap.value.get(s.spelerID)
  const toekomstMoyRuw = gemiddeldeVorig !== undefined ? (s.gemiddelde + gemiddeldeVorig) / 2 : s.gemiddelde
  const toekomstMoy = Math.round(toekomstMoyRuw * 1000) / 1000
  const toekomstCarAfgerond = Math.round(toekomstMoyRuw * BEURTEN_PER_PARTIJ * 100) / 100
  const toekomstCar = Math.round(toekomstCarAfgerond)

  return { ...s, plusMinVorig, res, toekomstMoy, toekomstCarAfgerond, toekomstCar }
}))

const movers = computed(() => {
  let omhoog = 0
  let omlaag = 0
  for (const s of spelersWeergave.value) {
    if (s.res === 'up') omhoog++
    else if (s.res === 'down') omlaag++
  }
  return { omhoog, omlaag }
})

const tiles = computed(() => {
  const totaalPartijen = spelers.value.reduce((sum, s) => sum + (s.aantalPartijen || 0), 0)
  const gemOpkomst = avonden.value.length
    ? avonden.value.reduce((sum, a) => sum + a.aantalSpelers, 0) / avonden.value.length
    : 0
  const laatsteDatum = avonden.value.length ? avonden.value[avonden.value.length - 1].datum : null

  return [
    { icon: 'mdi-calendar-month', label: 'Speelavonden', value: avonden.value.length },
    { icon: 'mdi-billiards', label: 'Partijen gespeeld', value: Math.round(totaalPartijen / 2) },
    { icon: 'mdi-account-group', label: 'Gem. opkomst', value: gemOpkomst.toFixed(1) },
    { icon: 'mdi-update', label: 'Bijgewerkt op', value: formatDate(laatsteDatum) }
  ]
})

async function loadSeizoenen() {
  const { data } = await axios.get('/api/spelers/seizoenen')
  seizoenen.value = data
  if (!seizoen.value && data.length) seizoen.value = data[0]
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

async function loadSpelersVorig() {
  if (!vorigSeizoen.value) {
    spelersVorig.value = []
    return
  }
  const { data } = await axios.get('/api/spelers', { params: { seizoen: vorigSeizoen.value } })
  spelersVorig.value = data
}

async function loadOpkomst() {
  const params = seizoen.value ? { seizoen: seizoen.value } : {}
  const { data } = await axios.get('/api/spelers/opkomst', { params })
  avonden.value = data
}

async function loadHoogsteSerie() {
  hoogsteSerieLoading.value = true
  try {
    const params = seizoen.value ? { seizoen: seizoen.value } : {}
    const { data } = await axios.get('/api/spelers/hoogste-serie', { params })
    hoogsteSerie.value = data.spelers
  } finally {
    hoogsteSerieLoading.value = false
  }
}

watch(seizoen, () => {
  loadSpelers()
  loadSpelersVorig()
  loadOpkomst()
  loadHoogsteSerie()
})

onMounted(async () => {
  await loadSeizoenen()
  await Promise.all([loadSpelers(), loadSpelersVorig(), loadOpkomst(), loadHoogsteSerie()])
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
.rank-number {
  color: #898781;
  font-weight: 500;
  padding-left: 6px;
}
.rooster-table :deep(th) {
  font-weight: 600 !important;
}
.rooster-table :deep(td:nth-child(3)),
.rooster-table :deep(td:nth-child(4)),
.rooster-table :deep(th:nth-child(3)),
.rooster-table :deep(th:nth-child(4)) {
  padding: 0 4px !important;
}
.trophy-icons {
  display: inline-flex;
  gap: 2px;
}
.hs-table :deep(th),
.hs-table :deep(td) {
  padding: 0 12px;
  white-space: nowrap;
}
.table-scroll {
  overflow-x: auto;
}
@media (max-width: 600px) {
  .stat-value {
    font-size: 1.15rem;
  }
  .stat-label {
    font-size: 0.68rem;
  }
  .hs-table :deep(th),
  .hs-table :deep(td) {
    padding: 0 8px;
    font-size: 0.8rem;
  }
  .rooster-table :deep(th),
  .rooster-table :deep(td) {
    padding: 0 5px !important;
    font-size: 0.76rem;
    white-space: nowrap;
  }
}
.hs-group-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
  color: rgb(var(--v-theme-on-surface));
  opacity: 0.7;
  font-weight: 600;
}
</style>
