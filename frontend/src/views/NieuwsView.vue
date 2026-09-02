<template>
  <v-card elevation="2" rounded="lg">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
      <v-icon class="mr-2">mdi-newspaper-variant-outline</v-icon>
      Nieuws
    </v-card-title>

    <v-list v-if="nieuws.length" density="comfortable" class="pb-2">
      <template v-for="(item, i) in nieuws" :key="item._id">
        <v-list-item class="py-4">
          <v-list-item-title class="font-weight-medium text-body-1">{{ item.titel }}</v-list-item-title>
          <v-list-item-subtitle class="text-caption mb-1">{{ formatDate(item.datum) }}</v-list-item-subtitle>
          <div class="text-body-2 text-grey-darken-1">{{ item.samenvatting }}</div>
        </v-list-item>
        <v-divider v-if="i < nieuws.length - 1" />
      </template>
    </v-list>

    <div v-else class="pa-8 text-center text-grey">
      <v-icon size="48" class="mb-2">mdi-newspaper-off-outline</v-icon>
      <div>Nog geen nieuws geplaatst.</div>
    </div>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const nieuws = ref([])

function formatDate(d) {
  return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  const { data } = await axios.get('/api/nieuws')
  nieuws.value = data
})
</script>
