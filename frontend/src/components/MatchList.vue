<template>
  <v-card elevation="2">
    <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white">
      <v-icon class="mr-2">mdi-history</v-icon>
      Gespeelde partijen
    </v-card-title>

    <v-card-text class="pa-0">
      <v-list v-if="matches.length" lines="two">
        <template v-for="(match, i) in matches" :key="match._id">
          <v-list-item>
            <template #prepend>
              <v-avatar color="green-darken-3" class="text-white">
                {{ i + 1 }}
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-bold">
              {{ match.spelerNaam }} vs {{ match.tegenstanderNaam }}
              <v-chip size="small" class="ml-2" :color="winnerColor(match)">
                {{ winnerLabel(match) }}
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle>
              {{ formatDate(match.datum) }}
            </v-list-item-subtitle>

            <template #append>
              <v-btn icon="mdi-information-outline" variant="text" @click="selected = match" />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="red"
                :loading="deleting === match._id"
                @click="deleteMatch(match._id)"
              />
            </template>
          </v-list-item>

          <v-divider v-if="i < matches.length - 1" inset />
        </template>
      </v-list>

      <div v-else class="pa-8 text-center text-grey">
        <v-icon size="48" class="mb-2">mdi-billiards</v-icon>
        <div>Nog geen partijen opgeslagen.</div>
      </div>
    </v-card-text>
  </v-card>

  <!-- Detail dialog -->
  <v-dialog v-model="detailOpen" max-width="500">
    <v-card v-if="selected">
      <v-card-title class="bg-green-darken-3 text-white pa-4">
        <v-icon class="mr-2">mdi-billiards</v-icon>
        {{ selected.spelerNaam }} vs {{ selected.tegenstanderNaam }}
      </v-card-title>
      <v-card-text class="pt-4">
        <v-table>
          <tbody>
            <tr>
              <td><v-icon size="16" class="mr-1">mdi-billiards-rack</v-icon> Caramboles</td>
              <td class="text-right font-weight-bold">{{ selected.caramboles }} / {{ selected.aantalCaramboles }}</td>
            </tr>
            <tr>
              <td><v-icon size="16" class="mr-1">mdi-star</v-icon> Hoogste serie</td>
              <td class="text-right">{{ selected.hoogsteSet }}</td>
            </tr>
            <tr>
              <td><v-icon size="16" class="mr-1">mdi-rotate-right</v-icon> Beurten</td>
              <td class="text-right">{{ selected.beurten }}</td>
            </tr>
            <tr>
              <td><v-icon size="16" class="mr-1">mdi-calculator</v-icon> Gemiddelde</td>
              <td class="text-right">{{ selected.gemiddelde }} / {{ selected.teHalenGemiddelde }}</td>
            </tr>
            <tr>
              <td><v-icon size="16" class="mr-1">mdi-percent</v-icon> Plus/Min</td>
              <td class="text-right">{{ selected.plusMin }}%</td>
            </tr>
          </tbody>
        </v-table>
        <div class="text-caption text-grey mt-3">Gespeeld op: {{ formatDate(selected.datum) }}</div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn @click="selected = null">Sluiten</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'

const props = defineProps({ matches: Array })
const emit = defineEmits(['deleted'])

const selected = ref(null)
const detailOpen = computed({
  get: () => !!selected.value,
  set: (v) => { if (!v) selected.value = null }
})
const deleting = ref(null)

function formatDate(d) {
  return new Date(d).toLocaleDateString('nl-NL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function winnerLabel(match) {
  if (match.plusMin > 0) return match.spelerNaam + ' wint'
  if (match.plusMin < 0) return match.tegenstanderNaam + ' wint'
  return 'Gelijk'
}

function winnerColor(match) {
  if (match.plusMin === 0) return 'grey'
  return 'green-darken-3'
}

async function deleteMatch(id) {
  deleting.value = id
  try {
    await axios.delete(`/api/matches/${id}`)
    emit('deleted')
  } finally {
    deleting.value = null
  }
}
</script>
