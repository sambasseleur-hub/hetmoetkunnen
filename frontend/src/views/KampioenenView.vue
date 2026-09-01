<template>
  <v-row dense>
    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" height="100%">
        <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
          <v-icon class="mr-2">mdi-trophy</v-icon>
          Clubkampioenen
        </v-card-title>
        <v-list density="compact" class="pb-2">
          <v-list-item v-for="k in clubKampioenen" :key="k._id">
            <template #prepend>
              <span class="kampioen-jaar">{{ k.jaar }}</span>
            </template>
            <v-list-item-title :class="{ 'text-grey font-italic': isBijzonder(k.naam) }">
              {{ k.naam }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card elevation="2" rounded="lg" height="100%">
        <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
          <v-icon class="mr-2">mdi-trophy-variant</v-icon>
          Ome Jaap Bokaal
        </v-card-title>
        <v-list density="compact" class="pb-2">
          <v-list-item v-for="k in omeJaapKampioenen" :key="k._id">
            <template #prepend>
              <span class="kampioen-jaar">{{ k.jaar }}</span>
            </template>
            <v-list-item-title :class="{ 'text-grey font-italic': isBijzonder(k.naam) }">
              {{ k.naam }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const clubKampioenen = ref([])
const omeJaapKampioenen = ref([])

function isBijzonder(naam) {
  return naam === 'Finale niet gespeeld' || naam === 'Ome Jaap'
}

onMounted(async () => {
  const [club, omeJaap] = await Promise.all([
    axios.get('/api/kampioenen', { params: { type: 'club' } }),
    axios.get('/api/kampioenen', { params: { type: 'omejaap' } })
  ])
  clubKampioenen.value = club.data
  omeJaapKampioenen.value = omeJaap.data
})
</script>

<style scoped>
.kampioen-jaar {
  display: inline-block;
  min-width: 3rem;
  font-weight: 600;
  color: #2e7d32;
  margin-right: 12px;
}
</style>
