<template>
  <div>
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
        <v-icon class="mr-2">mdi-image-multiple</v-icon>
        Foto's
      </v-card-title>
      <v-card-text class="pa-4 text-body-2 text-grey-darken-1">
        Een overzicht van onze albums door de jaren heen. De foto's zelf worden nog toegevoegd.
      </v-card-text>
    </v-card>

    <v-row dense>
      <v-col v-for="album in albums" :key="album._id" cols="12" sm="6" md="4" lg="3">
        <v-card elevation="2" rounded="lg" class="album-card">
          <div class="album-thumb">
            <v-icon size="40" color="white">mdi-image-multiple-outline</v-icon>
          </div>
          <v-card-text>
            <div class="font-weight-medium">{{ album.titel }}</div>
            <div class="text-caption text-grey">{{ album.jaar }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="!albums.length" class="pa-8 text-center text-grey">
      <v-icon size="48" class="mb-2">mdi-image-off-outline</v-icon>
      <div>Nog geen albums gevonden.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const albums = ref([])

onMounted(async () => {
  const { data } = await axios.get('/api/fotoalbums')
  albums.value = data
})
</script>

<style scoped>
.album-card {
  height: 100%;
}
.album-thumb {
  height: 100px;
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
