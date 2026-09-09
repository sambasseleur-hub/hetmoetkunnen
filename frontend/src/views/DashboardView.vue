<template>
  <SpelerStats ref="spelerStats" class="mb-6" />
  <SpelerStatBeheer class="mb-6" />
  <MatchForm @saved="onMatchSaved" />
  <MatchList
    :matches="matches"
    :page="page"
    :total-pages="totalPages"
    @update:page="changePage"
    @deleted="loadMatches"
    class="mt-6"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MatchForm from '../components/MatchForm.vue'
import MatchList from '../components/MatchList.vue'
import SpelerStats from '../components/SpelerStats.vue'
import SpelerStatBeheer from '../components/SpelerStatBeheer.vue'

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

onMounted(loadMatches)
</script>
