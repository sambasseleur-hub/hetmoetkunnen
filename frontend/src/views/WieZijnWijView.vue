<template>
  <div>
    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-title class="text-h6 pa-4 bg-green-darken-3 text-white d-flex align-center">
        <v-icon class="mr-2">mdi-information-outline</v-icon>
        Over ons
      </v-card-title>
      <v-card-text class="pa-6">
        <p class="text-body-1 mb-2">
          Biljartvereniging "Het moet kunnen" is opgericht op 17 januari 1984 te Edam.
          We spelen wekelijks in ons vaste onderkomen, Thomas Café.
        </p>
        <p class="text-body-1 mb-0">
          Erevoorzitter: <strong>Piet Nordmann</strong> (sinds 2015).
        </p>
      </v-card-text>
    </v-card>

    <v-card elevation="2" rounded="lg" class="mb-6">
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center">
        <v-icon class="mr-2" color="green-darken-3">mdi-account-tie</v-icon>
        Bestuur
      </v-card-title>
      <v-row class="pa-4" dense>
        <v-col v-for="lid in bestuur" :key="lid.naam" cols="6" sm="4" md="2">
          <div class="bestuur-card">
            <v-avatar color="green-darken-3" size="56" class="mb-2">
              <span class="text-h6 text-white">{{ lid.naam.charAt(0) }}</span>
            </v-avatar>
            <div class="font-weight-medium" :class="{ 'text-grey': lid.vacant }">{{ lid.naam }}</div>
            <div class="text-caption text-grey">{{ lid.rol }}</div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-card elevation="2" rounded="lg">
      <v-card-title class="text-subtitle-1 pa-4 d-flex align-center">
        <v-icon class="mr-2" color="green-darken-3">mdi-map-marker-outline</v-icon>
        Contact
      </v-card-title>
      <v-card-text class="pa-6">
        <div class="text-body-1 font-weight-medium">Thomas Café</div>
        <div class="text-body-2 text-grey-darken-1 mb-3">Zoutziedershof 1, 1135 VG Edam</div>
        <v-btn
          href="https://www.google.com/maps/search/?api=1&query=Zoutziedershof+1+1135+VG+Edam"
          target="_blank"
          rel="noopener"
          variant="tonal"
          color="green-darken-3"
          prepend-icon="mdi-map"
          size="small"
        >
          Route
        </v-btn>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
const bestuur = [
  { naam: 'Jacco', rol: 'Voorzitter' },
  { naam: 'Justin', rol: 'Penningmeester' },
  { naam: 'Manja', rol: 'Secretaris' },
  { naam: 'Erik', rol: 'Technische zaken' },
  { naam: 'Vacant', rol: 'Algemene zaken', vacant: true }
]
</script>

<style scoped>
.bestuur-card {
  text-align: center;
  padding: 8px;
}
</style>
