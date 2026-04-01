<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white">
      <v-icon class="mr-2">mdi-plus-circle</v-icon>
      Nieuwe partij invoeren
    </v-card-title>

    <v-card-text class="pt-4">
      <v-form ref="form" v-model="valid" @submit.prevent="submit">
        <v-row>
          <!-- Player 1 -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-1 font-weight-bold mb-3 text-green-darken-3">
              <v-icon class="mr-1">mdi-account</v-icon> Speler 1
            </div>
            <v-text-field
              v-model="player1.name"
              label="Naam"
              :rules="[required]"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />
            <v-text-field
              v-model.number="player1.caramboles"
              label="Aantal caramboles"
              type="number"
              :rules="[required, minZero]"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              prepend-inner-icon="mdi-billiards-rack"
            />
            <v-text-field
              v-model.number="player1.highScore"
              label="Hoogste serie"
              type="number"
              :rules="[required, minZero]"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              prepend-inner-icon="mdi-star"
            />
            <v-text-field
              v-model.number="player1.turns"
              label="Aantal beurten"
              type="number"
              :rules="[required, minOne]"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-rotate-right"
            />
          </v-col>

          <!-- Player 2 -->
          <v-col cols="12" md="6">
            <div class="text-subtitle-1 font-weight-bold mb-3 text-green-darken-3">
              <v-icon class="mr-1">mdi-account</v-icon> Speler 2
            </div>
            <v-text-field
              v-model="player2.name"
              label="Naam"
              :rules="[required]"
              variant="outlined"
              density="comfortable"
              class="mb-2"
            />
            <v-text-field
              v-model.number="player2.caramboles"
              label="Aantal caramboles"
              type="number"
              :rules="[required, minZero]"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              prepend-inner-icon="mdi-billiards-rack"
            />
            <v-text-field
              v-model.number="player2.highScore"
              label="Hoogste serie"
              type="number"
              :rules="[required, minZero]"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              prepend-inner-icon="mdi-star"
            />
            <v-text-field
              v-model.number="player2.turns"
              label="Aantal beurten"
              type="number"
              :rules="[required, minOne]"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-rotate-right"
            />
          </v-col>
        </v-row>

        <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
          {{ error }}
        </v-alert>

        <div class="d-flex justify-end gap-2">
          <v-btn variant="text" @click="reset">Reset</v-btn>
          <v-btn
            type="submit"
            color="green-darken-3"
            :loading="saving"
            :disabled="!valid"
            prepend-icon="mdi-content-save"
          >
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
import { ref } from 'vue'
import axios from 'axios'

const emit = defineEmits(['saved'])

const form = ref(null)
const valid = ref(false)
const saving = ref(false)
const snackbar = ref(false)
const error = ref('')

const emptyPlayer = () => ({ name: '', caramboles: null, highScore: null, turns: null })

const player1 = ref(emptyPlayer())
const player2 = ref(emptyPlayer())

const required = (v) => (v !== null && v !== '') || 'Verplicht veld'
const minZero = (v) => v >= 0 || 'Moet 0 of hoger zijn'
const minOne = (v) => v >= 1 || 'Moet minimaal 1 zijn'

async function submit() {
  const { valid: isValid } = await form.value.validate()
  if (!isValid) return

  saving.value = true
  error.value = ''
  try {
    await axios.post('/api/matches', {
      player1: player1.value,
      player2: player2.value
    })
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
  player1.value = emptyPlayer()
  player2.value = emptyPlayer()
  form.value?.reset()
}
</script>
