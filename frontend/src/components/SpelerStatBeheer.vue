<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
      <v-icon class="mr-2">mdi-table-account</v-icon>
      Speler stats
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
        class="text-white mr-3"
      />
      <v-btn prepend-icon="mdi-plus" color="white" variant="tonal" @click="openAdd">
        Toevoegen
      </v-btn>
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="stats"
      :loading="loading"
      items-per-page="25"
      class="elevation-0"
    >
      <template #item.actions="{ item }">
        <v-btn icon="mdi-pencil" size="small" variant="text" @click="openEdit(item)" />
        <v-btn icon="mdi-delete-outline" size="small" variant="text" color="red" :loading="deleting === item._id" @click="remove(item)" />
      </template>

      <template #no-data>
        <div class="pa-8 text-center text-grey">
          <v-icon size="48" class="mb-2">mdi-table-off</v-icon>
          <div>Geen records gevonden.</div>
        </div>
      </template>
    </v-data-table>
  </v-card>

  <!-- Add / Edit dialog -->
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title class="bg-green-darken-3 text-white pa-4">
        {{ editing ? 'Bewerken' : 'Toevoegen' }}
      </v-card-title>
      <v-card-text class="pt-4">
        <v-form ref="form" v-model="valid">
          <v-select
            v-model="row.spelerID"
            :items="leden"
            item-title="label"
            item-value="lidNummer"
            label="Speler"
            :rules="[required]"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :disabled="!!editing"
          />
          <v-text-field
            v-model.number="row.seizoenID"
            label="Seizoen"
            type="number"
            :rules="[required]"
            variant="outlined"
            density="comfortable"
            class="mb-3"
            :disabled="!!editing"
          />
          <v-text-field
            v-model.number="row.teHalenGemiddelde"
            label="Te halen gemiddelde"
            type="number"
            step="0.001"
            :rules="[required, minZero]"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-text-field
            v-model.number="row.aantalCaramboles"
            label="Aantal caramboles"
            type="number"
            :rules="[required, minZero]"
            variant="outlined"
            density="comfortable"
          />
        </v-form>
        <v-alert v-if="error" type="error" class="mt-3" density="compact">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="dialog = false">Annuleren</v-btn>
        <v-btn color="green-darken-3" :loading="saving" :disabled="!valid" @click="save">
          Opslaan
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const stats = ref([])
const leden = ref([])
const seizoenen = ref([])
const seizoen = ref(null)
const loading = ref(false)
const deleting = ref(null)
const dialog = ref(false)
const saving = ref(false)
const valid = ref(false)
const error = ref('')
const editing = ref(null)
const form = ref(null)

const emptyRow = () => ({ spelerID: null, seizoenID: null, teHalenGemiddelde: null, aantalCaramboles: null })
const row = ref(emptyRow())

const headers = [
  { title: 'Naam', key: 'naam', sortable: true },
  { title: 'Seizoen', key: 'seizoenID', sortable: true },
  { title: 'Te halen gem.', key: 'teHalenGemiddelde', sortable: true },
  { title: 'Aantal caramboles', key: 'aantalCaramboles', sortable: true },
  { title: '', key: 'actions', sortable: false, align: 'end' }
]

const required = (v) => (v !== null && v !== '') || 'Verplicht veld'
const minZero = (v) => v >= 0 || 'Moet 0 of hoger zijn'

async function load() {
  loading.value = true
  try {
    const params = seizoen.value ? { seizoen: seizoen.value } : {}
    const { data } = await axios.get('/api/speler-stats', { params })
    stats.value = data
  } finally {
    loading.value = false
  }
}

watch(seizoen, load)

function openAdd() {
  editing.value = null
  row.value = emptyRow()
  error.value = ''
  dialog.value = true
}

function openEdit(item) {
  editing.value = item._id
  row.value = { spelerID: item.spelerID, seizoenID: item.seizoenID, teHalenGemiddelde: item.teHalenGemiddelde, aantalCaramboles: item.aantalCaramboles }
  error.value = ''
  dialog.value = true
}

async function save() {
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return
  saving.value = true
  error.value = ''
  try {
    if (editing.value) {
      await axios.put(`/api/speler-stats/${editing.value}`, row.value)
    } else {
      await axios.post('/api/speler-stats', row.value)
    }
    dialog.value = false
    await load()
  } catch (err) {
    error.value = err.response?.data?.message || 'Er is iets misgegaan'
  } finally {
    saving.value = false
  }
}

async function remove(item) {
  deleting.value = item._id
  try {
    await axios.delete(`/api/speler-stats/${item._id}`)
    await load()
  } finally {
    deleting.value = null
  }
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
  seizoenen.value = seizoenenRes.data
  await load()
})
</script>
