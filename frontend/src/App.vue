<template>
  <v-app>
    <v-app-bar color="green-darken-3" elevation="2">
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-billiards</v-icon>
        Biljarts Tracker
      </v-app-bar-title>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8">
        <SpelerStats class="mb-6" />
        <MatchForm @saved="loadMatches" />
        <MatchList :matches="matches" @deleted="loadMatches" class="mt-6" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import MatchForm from './components/MatchForm.vue'
import MatchList from './components/MatchList.vue'
import SpelerStats from './components/SpelerStats.vue'

const matches = ref([])

async function loadMatches() {
  const { data } = await axios.get('/api/matches')
  matches.value = data.matches
}

onMounted(loadMatches)
</script>
