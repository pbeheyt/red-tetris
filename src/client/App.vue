<script setup>
import { onMounted } from 'vue';
import { useGameStore } from './stores/gameStore';
import { audioService } from './services/audioService';

// Le composant App.vue est la "coquille" principale de l'application.
// C'est le meilleur endroit pour initialiser des services globaux comme le store de jeu.

const gameStore = useGameStore();

// onMounted est appelé une seule fois lorsque le composant App est créé.
// C'est le moment idéal pour établir la connexion socket qui persistera
// pendant toute la durée de vie de l'application.
onMounted(() => {
  gameStore.initializeStore();
  audioService.init();
});
</script>

<template>
  <div id="main-container">
    <header>
      <h1>Red Tetris</h1>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style>
/* Styles globaux - non "scoped" pour s'appliquer à toute l'application */
body {
  font-family: Arial, sans-serif;
  background-color: #f0f2f5;
  margin: 0;
  padding: 0;
  color: #333;
}

#main-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  margin-bottom: 20px;
}

h1 {
  color: #c0392b; /* Rouge "Red Pelicans" */
}
</style>
