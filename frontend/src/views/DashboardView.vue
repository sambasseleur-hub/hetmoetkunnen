<template>
  <div class="d-flex justify-end mb-4">
    <v-btn variant="tonal" color="red-darken-1" prepend-icon="mdi-logout" @click="logout">
      Uitloggen
    </v-btn>
  </div>

  <MatchForm @saved="onMatchSaved" class="mb-6" />
  <MatchList
    :matches="matches"
    :page="page"
    :total-pages="totalPages"
    @update:page="changePage"
    @deleted="loadMatches"
    class="mb-6"
  />
  <SpelerStats ref="spelerStats" class="mb-6" />
  <SpelerStatBeheer class="mb-6" />
  <LedenBeheer class="mb-6" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import MatchForm from '../components/MatchForm.vue'
import MatchList from '../components/MatchList.vue'
import SpelerStats from '../components/SpelerStats.vue'
import SpelerStatBeheer from '../components/SpelerStatBeheer.vue'
import LedenBeheer from '../components/LedenBeheer.vue'
import { clearToken } from '../utils/auth'

const router = useRouter()
const matches = ref([])
const page = ref(1)
const totalPages = ref(1)
const spelerStats = ref(null)

async function loadMatches() {
  const { data } = await axios.get('/api/matches', { params: { page: page.value } })
  matches.value = data.matches
  totalPages.value = data.totalPages
}

function changePage(p) {
  page.value = p
  loadMatches()
}

async function onMatchSaved() {
  page.value = 1
  await loadMatches()
  await spelerStats.value?.refresh()
}

function logout() {
  clearToken()
  router.push({ name: 'home' })
}

onMounted(loadMatches)
</script>
