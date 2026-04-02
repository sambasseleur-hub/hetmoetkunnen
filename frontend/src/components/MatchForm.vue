<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white">
      <v-icon class="mr-2">mdi-plus-circle</v-icon>
      Nieuwe partij invoeren
    </v-card-title>

    <v-card-text class="pt-4">
      <v-form ref="form" v-model="valid" @submit.prevent="submit">

        <!-- Shared metadata -->
        <v-row>
          <v-col cols="12" md="4">
            <v-select
              v-model="spelerID"
              :items="leden"
              item-title="label"
              item-value="lidNummer"
              label="Speler"
              :rules="[required]"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account"
            />
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              v-model="tegenstanderID"
              :items="leden"
              item-title="label"
              item-value="lidNummer"
              label="Tegenstander"
              :rules="[required, notSelf]"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-arrow-right"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model.number="seizoenID"
              label="Seizoen"
              type="number"
              :rules="[required]"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-calendar-range"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-text-field
              v-model="datum"
              label="Datum"
              type="date"
              :rules="[required]"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-calendar"
            />
          </v-col>
        </v-row>

        <!-- Per-player stats -->
        <v-row class="mt-2">
          <!-- Speler -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 font-weight-bold mb-3 text-green-darken-3">
              <v-icon size="16" class="mr-1">mdi-account</v-icon> Speler stats
            </div>
            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model.number="speler.caramboles" label="Caramboles" type="number" :rules="[required, minZero]" variant="outlined" density="comfortable" prepend-inner-icon="mdi-billiards-rack" @update:model-value="recompute('speler')" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="speler.aantalCaramboles" label="Te halen caramboles" type="number" :rules="[required, minZero]" variant="outlined" density="comfortable" readonly style="pointer-events: none" tabindex="-1" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="beurten" label="Beurten" type="number" :rules="[required, minOne]" variant="outlined" density="comfortable" prepend-inner-icon="mdi-rotate-right" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="speler.hoogsteSet" label="Hoogste serie" type="number" :rules="[required, minZero]" variant="outlined" density="comfortable" prepend-inner-icon="mdi-star" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="speler.teHalenGemiddelde" label="Te halen gem." type="number" step="0.001" :rules="[required, minZero]" variant="outlined" density="comfortable" readonly style="pointer-events: none" tabindex="-1" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="speler.gemiddelde" label="Gemiddelde" type="number" step="0.001" variant="outlined" density="comfortable" readonly style="pointer-events: none" tabindex="-1" hint="Auto-berekend" persistent-hint />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="speler.plusMin" label="Plus/Min" type="number" step="0.001" variant="outlined" density="comfortable" readonly style="pointer-events: none" tabindex="-1" hint="Auto-berekend" persistent-hint />
              </v-col>
            </v-row>
          </v-col>

          <v-divider vertical class="mx-2" />

          <!-- Tegenstander -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-2 font-weight-bold mb-3 text-green-darken-3">
              <v-icon size="16" class="mr-1">mdi-account-arrow-right</v-icon> Tegenstander stats
            </div>
            <v-row dense>
              <v-col cols="6">
                <v-text-field v-model.number="tegenstander.caramboles" label="Caramboles" type="number" :rules="[required, minZero]" variant="outlined" density="comfortable" prepend-inner-icon="mdi-billiards-rack" @update:model-value="recompute('tegenstander')" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="tegenstander.aantalCaramboles" label="Te halen caramboles" type="number" :rules="[required, minZero]" variant="outlined" density="comfortable" readonly style="pointer-events: none" tabindex="-1" />
              </v-col>
              <v-col cols="6">
                <v-text-field v-model.number="tegenstander.hoogsteSet" label="Hoogste serie" type="number" :rules="[required, minZero]" variant="outlined" density="comfortable" prepend-inner-icon="mdi-star" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="tegenstander.teHalenGemiddelde" label="Te halen gem." type="number" step="0.001" :rules="[required, minZero]" variant="outlined" density="comfortable" readonly style="pointer-events: none" tabindex="-1" />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="tegenstander.gemiddelde" label="Gemiddelde" type="number" step="0.001" variant="outlined" density="comfortable" readonly style="pointer-events: none" tabindex="-1" hint="Auto-berekend" persistent-hint />
              </v-col>
              <v-col cols="4">
                <v-text-field v-model.number="tegenstander.plusMin" label="Plus/Min" type="number" step="0.001" variant="outlined" density="comfortable" readonly style="pointer-events: none" tabindex="-1" hint="Auto-berekend" persistent-hint />
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-alert v-if="error" type="error" class="mb-4 mt-2" closable @click:close="error = ''">
          {{ error }}
        </v-alert>

        <div class="d-flex justify-end gap-2 mt-2">
          <v-btn variant="text" @click="reset">Reset</v-btn>
          <v-btn type="submit" color="green-darken-3" :loading="saving" :disabled="!valid" prepend-icon="mdi-content-save">
            Opslaan
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>

  <v-snackbar v-model="snackbar" color="success" timeout="3000">
    Partij opgeslagen!
    <template #actions>
      <v-btn variant="text" @click="snackbar = false">Sluiten</v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['saved'])

const form = ref(null)
const valid = ref(false)
const saving = ref(false)
const snackbar = ref(false)
const error = ref('')
const leden = ref([])

const spelerID = ref(null)
const tegenstanderID = ref(null)
const seizoenID = ref(null)
function lastWednesday() {
  const d = new Date()
  const daysBack = (d.getDay() + 4) % 7  // days since last Wednesday (0 if today is Wednesday)
  d.setDate(d.getDate() - daysBack)
  return d.toISOString().slice(0, 10)
}

const datum = ref(lastWednesday())

const beurten = ref(null)
const emptyStats = () => ({ caramboles: null, aantalCaramboles: null, hoogsteSet: null, teHalenGemiddelde: null, gemiddelde: null, plusMin: null })
const speler = ref(emptyStats())
const tegenstander = ref(emptyStats())

const required = (v) => (v !== null && v !== '') || 'Verplicht veld'
const minZero = (v) => v >= 0 || 'Moet 0 of hoger zijn'
const minOne = (v) => v >= 1 || 'Moet minimaal 1 zijn'
const notSelf = (v) => v !== spelerID.value || 'Mag niet dezelfde speler zijn'

function recompute(side) {
  const sides = side ? [side === 'speler' ? speler.value : tegenstander.value] : [speler.value, tegenstander.value]
  for (const s of sides) {
    if (s.caramboles !== null && beurten.value) {
      s.gemiddelde = Math.round((s.caramboles / beurten.value) * 1000) / 1000
      if (s.teHalenGemiddelde !== null) {
        s.plusMin = Math.round((s.gemiddelde - s.teHalenGemiddelde) * 1000) / 1000
      }
    }
  }
}

watch(beurten, () => recompute())

async function fetchStat(id, target) {
  if (!id || !seizoenID.value) return
  try {
    const { data } = await axios.get('/api/speler-stats', { params: { speler: id, seizoen: seizoenID.value } })
    if (data.length) {
      target.aantalCaramboles = data[0].aantalCaramboles
      target.teHalenGemiddelde = data[0].teHalenGemiddelde
      recompute(target === speler.value ? 'speler' : 'tegenstander')
    }
  } catch {}
}

watch([spelerID, seizoenID], () => fetchStat(spelerID.value, speler.value))
watch([tegenstanderID, seizoenID], () => fetchStat(tegenstanderID.value, tegenstander.value))

async function submit() {
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  saving.value = true
  error.value = ''
  try {
    await axios.post('/api/matches', { spelerID: spelerID.value, tegenstanderID: tegenstanderID.value, seizoenID: seizoenID.value, datum: datum.value, beurten: beurten.value, ...speler.value })
    await axios.post('/api/matches', { spelerID: tegenstanderID.value, tegenstanderID: spelerID.value, seizoenID: seizoenID.value, datum: datum.value, beurten: beurten.value, ...tegenstander.value })
    snackbar.value = true
    reset()
    emit('saved')
  } catch (err) {
    error.value = err.response?.data?.message || 'Er is iets misgegaan'
  } finally {
    saving.value = false
  }
}

function reset() {
  spelerID.value = null
  tegenstanderID.value = null
  seizoenID.value = null
  datum.value = lastWednesday()
  beurten.value = null
  speler.value = emptyStats()
  tegenstander.value = emptyStats()
  form.value?.reset()
}

onMounted(async () => {
  const [ledenRes, seizoenenRes] = await Promise.all([
    axios.get('/api/leden'),
    axios.get('/api/spelers/seizoenen')
  ])
  leden.value = ledenRes.data.map(l => ({
    lidNummer: l.lidNummer,
    label: l.schermnaam || `${l.voornaam} ${l.achternaam}`
  }))
  if (seizoenenRes.data.length) seizoenID.value = seizoenenRes.data[0]
})
</script>
