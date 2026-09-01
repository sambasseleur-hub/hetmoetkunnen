<template>
  <SpelerStats class="mb-6" />
  <SpelerStatBeheer class="mb-6" />
  <MatchForm @saved="loadMatches" />
  <MatchList :matches="matches" @deleted="loadMatches" class="mt-6" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MatchForm from '../components/MatchForm.vue'
import MatchList from '../components/MatchList.vue'
import SpelerStats from '../components/SpelerStats.vue'
import SpelerStatBeheer from '../components/SpelerStatBeheer.vue'

const matches = ref([])

async function loadMatches() {
  const { data } = await axios.get('/api/matches')
  matches.value = data.matches
}

onMounted(loadMatches)
</script>
