<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
      <v-icon class="mr-2">mdi-account-multiple-outline</v-icon>
      Leden
    </v-card-title>

    <v-data-table
      :headers="headers"
      :items="leden"
      :loading="loading"
      items-per-page="25"
      class="elevation-0"
    >
      <template #item.naam="{ item }">
        {{ item.schermnaam || `${item.voornaam} ${item.achternaam}` }}
      </template>

      <template #item.actiefLid="{ item }">
        <v-switch
          :model-value="item.actiefLid"
          color="green-darken-3"
          hide-details
          density="compact"
          :loading="saving === item.lidNummer"
          @update:model-value="(val) => toggleActief(item, val)"
        />
      </template>

      <template #no-data>
        <div class="pa-8 text-center text-grey">
          <v-icon size="48" class="mb-2">mdi-account-off</v-icon>
          <div>Geen leden gevonden.</div>
        </div>
      </template>
    </v-data-table>

    <v-alert v-if="error" type="error" class="mx-4 mb-4" density="compact">{{ error }}</v-alert>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const leden = ref([])
const loading = ref(false)
const saving = ref(null)
const error = ref('')

const headers = [
  { title: 'Naam', key: 'naam', sortable: true },
  { title: 'Actief lid', key: 'actiefLid', sortable: true, align: 'end' }
]

async function load() {
  loading.value = true
  try {
    const { data } = await axios.get('/api/leden/alle')
    leden.value = data
  } finally {
    loading.value = false
  }
}

async function toggleActief(item, val) {
  saving.value = item.lidNummer
  error.value = ''
  try {
    await axios.put(`/api/leden/${item.lidNummer}/actief`, { actiefLid: val })
    item.actiefLid = val
  } catch (err) {
    error.value = err.response?.data?.message || 'Er is iets misgegaan'
  } finally {
    saving.value = null
  }
}

onMounted(load)
</script>
