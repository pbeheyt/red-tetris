<script setup>
import { onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from './stores/gameStore';
import GameBoard from './components/GameBoard.vue';

const gameStore = useGameStore();
const route = useRoute();

const handlePlayerAction = (action) => {
  gameStore.sendPlayerAction(action);
};

// watchEffect s'exécutera une fois immédiatement, puis à chaque fois
// que les dépendances réactives (ici, route.params) changent.
watchEffect(() => {
  const { roomName, playerName } = route.params;

  // On s'assure que les paramètres sont présents ET que nous ne sommes pas déjà connectés.
  // Cela empêche les reconnexions multiples si l'URL changeait pour une raison quelconque.
  if (roomName && playerName && !gameStore.isConnected) {
    console.log(`Connexion à la partie '${roomName}' en tant que '${playerName}'`);
    gameStore.initializeSocket(roomName, playerName);
  }
});

onUnmounted(() => {
  gameStore.disconnectSocket();
});
</script>

<template>
  <div class="app-container">
    <h1>Red Tetris</h1>

    <div v-if="route.params.roomName && route.params.playerName">
      <p>Partie : <strong>{{ route.params.roomName }}</strong></p>
      <p>Joueur : <strong>{{ route.params.playerName }}</strong></p>
      <p>État : <strong :style="{ color: gameStore.isConnected ? 'green' : 'red' }">{{ gameStore.isConnected ? 'Connecté' : 'En cours de connexion...' }}</strong></p>

      <GameBoard
        :board="gameStore.board"
        :active-piece="gameStore.activePiece"
        @player-action="handlePlayerAction"
      />
    </div>

    <div v-else class="welcome-message">
      <h2>Bienvenue sur Red Tetris !</h2>
      <p>Pour rejoindre ou créer une partie, veuillez utiliser une URL au format :</p>
      <code>/#/nom-de-la-partie/votre-nom</code>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
  color: #333;
}

.welcome-message {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  padding: 20px;
  margin: 20px auto;
  max-width: 600px;
  border-radius: 8px;
}

.welcome-message code {
  background-color: #e0e0e0;
  padding: 3px 6px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
}
</style>
