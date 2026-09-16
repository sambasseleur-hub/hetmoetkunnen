<template>
  <v-row justify="center" class="mt-12">
    <v-col cols="12" sm="6" md="4">
      <v-card elevation="2" rounded="lg">
        <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
          <v-icon class="mr-2">mdi-lock-outline</v-icon>
          Inloggen
        </v-card-title>
        <v-card-text class="pa-6">
          <v-form @submit.prevent="submit">
            <v-text-field
              v-model="password"
              label="Wachtwoord"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-key-outline"
              autofocus
              :error-messages="error"
            />
            <v-btn
              type="submit"
              color="green-darken-3"
              block
              :loading="loading"
              prepend-icon="mdi-login"
              class="mt-2"
            >
              Inloggen
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { setToken } from '../utils/auth'

const router = useRouter()
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.post('/api/auth/login', { password: password.value })
    setToken(data.token)
    router.push({ name: 'beheer' })
  } catch (err) {
    error.value = err.response?.data?.message || 'Er is iets misgegaan'
  } finally {
    loading.value = false
  }
}
</script>
