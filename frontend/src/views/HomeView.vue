<template>
  <div>
    <div class="hero">
      <img src="/logos/hetmoetkunnen.png" alt="Het moet kunnen logo" class="hero-logo">
      <div class="hero-text">
        <div class="hero-kicker">Biljart Vereniging</div>
        <div class="hero-title">Het moet Kunnen</div>
        <div class="hero-sub">Opgericht op 17 januari 1984 te Edam</div>
      </div>
    </div>

    <v-row class="mt-6" dense>
      <v-col cols="12" sm="6" md="3" v-for="link in quickLinks" :key="link.to">
        <v-card :to="link.to" elevation="2" rounded="lg" class="quick-link" hover>
          <v-card-text class="text-center py-6">
            <v-icon :icon="link.icon" size="32" color="green-darken-3" class="mb-2" />
            <div class="text-subtitle-1 font-weight-medium">{{ link.label }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-card elevation="2" rounded="lg" class="mt-6">
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center">
        <v-icon class="mr-2" color="green-darken-3">mdi-newspaper-variant-outline</v-icon>
        Laatste nieuws
      </v-card-title>
      <v-list v-if="laatsteNieuws.length" density="comfortable" class="pb-2">
        <v-list-item v-for="item in laatsteNieuws" :key="item._id" :to="{ name: 'nieuws' }">
          <v-list-item-title class="font-weight-medium">{{ item.titel }}</v-list-item-title>
          <v-list-item-subtitle>{{ formatDate(item.datum) }} — {{ item.samenvatting }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
      <div v-else class="pa-8 text-center text-grey">
        <v-icon size="40" class="mb-2">mdi-newspaper-off-outline</v-icon>
        <div>Nog geen nieuws geplaatst.</div>
      </div>
    </v-card>

    <v-card elevation="2" rounded="lg" class="mt-6">
      <v-card-text class="d-flex flex-wrap align-center justify-space-between ga-4">
        <div class="d-flex align-center ga-3">
          <img src="/logos/logothomas.png" alt="Thomas Café logo" class="sponsor-logo">
          <span class="text-body-2 text-grey-darken-1">Vaste speellocatie: Thomas Café, Zoutziedershof 1, 1135 VG Edam</span>
        </div>
        <span class="text-caption text-grey">IBAN: NL 11 RABO 0315 6824 77</span>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const laatsteNieuws = ref([])

const quickLinks = [
  { to: { name: 'rooster' }, icon: 'mdi-podium', label: 'Rooster' },
  { to: { name: 'kampioenen' }, icon: 'mdi-trophy', label: 'Kampioenen' },
  { to: { name: 'wie-zijn-wij' }, icon: 'mdi-account-group', label: 'Wie zijn wij' },
  { to: { name: 'fotos' }, icon: 'mdi-image-multiple', label: "Foto's" }
]

function formatDate(d) {
  return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' })
}

onMounted(async () => {
  const { data } = await axios.get('/api/nieuws')
  laatsteNieuws.value = data.slice(0, 4)
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
  border-radius: 12px;
  padding: 32px 40px;
  display: flex;
  align-items: center;
  gap: 28px;
  color: white;
}
.hero-logo {
  width: 100px;
  height: auto;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}
.hero-kicker {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
  opacity: 0.85;
}
.hero-title {
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.15;
}
.hero-sub {
  margin-top: 6px;
  font-size: 0.95rem;
  opacity: 0.9;
}
.quick-link {
  text-decoration: none;
}
.sponsor-logo {
  height: 40px;
  width: auto;
}
@media (max-width: 600px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
}
</style>
