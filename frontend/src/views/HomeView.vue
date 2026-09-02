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

    <v-row class="mt-6" dense>
      <v-col cols="12" md="7">
        <v-card elevation="2" rounded="lg" height="100%">
          <v-card-title class="text-subtitle-1 pa-4 d-flex align-center flex-wrap">
            <v-icon class="mr-2" color="green-darken-3">mdi-calendar-star</v-icon>
            Laatste speelavond
            <span v-if="laatsteSpeelavond.datum" class="text-caption text-grey ml-2">
              {{ formatDate(laatsteSpeelavond.datum) }}
            </span>
          </v-card-title>

          <v-list v-if="laatsteSpeelavond.partijen.length" density="comfortable" class="pb-2 evening-list">
            <template v-for="(p, i) in laatsteSpeelavond.partijen" :key="i">
              <v-list-item>
                <v-list-item-title>
                  <span :class="{ 'font-weight-bold': p.plusMin >= 0 }">{{ p.spelerNaam }}</span>
                  <span class="text-grey mx-1">–</span>
                  <span :class="{ 'font-weight-bold': p.plusMin < 0 }">{{ p.tegenstanderNaam }}</span>
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ p.caramboles }} car. in {{ p.beurten }} beurten &middot; moy. {{ round2(p.gemiddelde) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-divider v-if="i < laatsteSpeelavond.partijen.length - 1" />
            </template>
          </v-list>
          <div v-else class="pa-8 text-center text-grey">
            <v-icon size="40" class="mb-2">mdi-billiards</v-icon>
            <div>Nog geen partijen gespeeld.</div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <v-card elevation="2" rounded="lg" height="100%">
          <v-card-title class="text-subtitle-1 pa-4 d-flex align-center">
            <v-icon class="mr-2" color="green-darken-3">mdi-star-outline</v-icon>
            Hoogtepunten
          </v-card-title>

          <div v-if="laatsteSpeelavond.datum" class="pa-4 pt-2">
            <div v-for="cat in hoogtepuntCategorieen" :key="cat.key" class="mb-4">
              <div class="d-flex align-center mb-1">
                <v-icon size="18" color="green-darken-3" class="mr-2">{{ cat.icon }}</v-icon>
                <span class="text-subtitle-2 font-weight-medium">{{ cat.label }}</span>
              </div>
              <div
                v-for="(item, i) in laatsteSpeelavond[cat.key]"
                :key="item.naam"
                class="d-flex align-center py-1"
              >
                <span class="podium-rank" :class="`rank-${i + 1}`">{{ i + 1 }}</span>
                <span class="flex-grow-1">{{ item.naam }}</span>
                <span class="text-grey text-body-2">{{ cat.format(item.waarde) }}</span>
              </div>
              <div v-if="!laatsteSpeelavond[cat.key].length" class="text-grey text-body-2">–</div>
            </div>
          </div>
          <div v-else class="pa-8 text-center text-grey">
            <v-icon size="40" class="mb-2">mdi-star-off-outline</v-icon>
            <div>Nog geen hoogtepunten.</div>
          </div>
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
const laatsteSpeelavond = ref({ datum: null, partijen: [], hoogsteSerie: null, besteResultaat: null, meesteCaramboles: null })

const quickLinks = [
  { to: { name: 'rooster' }, icon: 'mdi-podium', label: 'Rooster' },
  { to: { name: 'kampioenen' }, icon: 'mdi-trophy', label: 'Kampioenen' },
  { to: { name: 'wie-zijn-wij' }, icon: 'mdi-account-group', label: 'Wie zijn wij' },
  { to: { name: 'fotos' }, icon: 'mdi-image-multiple', label: "Foto's" }
]

function formatDate(d) {
  return new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' })
}

function round2(n) {
  return Math.round(n * 100) / 100
}

const hoogtepuntCategorieen = [
  { key: 'hoogsteSerie', label: 'Hoogste serie', icon: 'mdi-trophy-outline', format: (v) => v },
  { key: 'besteResultaat', label: 'Beste resultaat', icon: 'mdi-trending-up', format: (v) => `${v > 0 ? '+' : ''}${round2(v)}%` },
  { key: 'meesteCaramboles', label: 'Meeste caramboles', icon: 'mdi-billiards-rack', format: (v) => v }
]

onMounted(async () => {
  const [nieuwsRes, speelavondRes] = await Promise.all([
    axios.get('/api/nieuws'),
    axios.get('/api/spelers/laatste-speelavond')
  ])
  laatsteNieuws.value = nieuwsRes.data.slice(0, 4)
  laatsteSpeelavond.value = speelavondRes.data
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
.evening-list {
  max-height: 340px;
  overflow-y: auto;
}
.podium-rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  margin-right: 10px;
  flex-shrink: 0;
  background: #9e9e9e;
}
.podium-rank.rank-1 {
  background: #c9a227;
}
.podium-rank.rank-2 {
  background: #9aa0a6;
}
.podium-rank.rank-3 {
  background: #a1662f;
}
@media (max-width: 600px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
}
</style>
