<template>
  <v-app>
    <v-app-bar color="green-darken-3" elevation="2">
      <v-app-bar-title>
        <v-icon class="mr-2">mdi-billiards</v-icon>
        Biljarts Tracker
      </v-app-bar-title>

      <v-tabs v-model="tab" align-tabs="end" color="white" slider-color="white">
        <v-tab :to="{ name: 'rooster' }" value="rooster">
          <v-icon class="mr-1" size="18">mdi-podium</v-icon>
          Rooster
        </v-tab>
        <v-tab :to="{ name: 'kampioenen' }" value="kampioenen">
          <v-icon class="mr-1" size="18">mdi-trophy</v-icon>
          Kampioenen
        </v-tab>
        <v-tab :to="{ name: 'beheer' }" value="beheer">
          <v-icon class="mr-1" size="18">mdi-cog</v-icon>
          Beheer
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <v-main class="bg-grey-lighten-4">
      <v-container class="py-8">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref('rooster')
</script>
