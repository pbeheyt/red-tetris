<script setup>
import { onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { state as socketState } from '../services/socketService.js';
import GameBoard from '../components/GameBoard.vue';

const gameStore = useGameStore();
const route = useRoute();

const handlePlayerAction = (action) => {
  gameStore.sendPlayerAction(action);
};

const handleStartGame = () => {
  gameStore.sendStartGame();
};

// watchEffect s'exécutera une fois immédiatement, puis à chaque fois
// que les dépendances réactives (ici, route.params) changent.
watchEffect(() => {
  const { roomName, playerName } = route.params;

  // On s'assure que les paramètres sont présents ET que nous ne sommes pas déjà connectés.
  // Cela empêche les reconnexions multiples.
  if (roomName && playerName && !socketState.isConnected) {
    console.log(`Déclenchement de la connexion à la partie '${roomName}' en tant que '${playerName}'`);
    gameStore.connectAndJoin(roomName, playerName);
  }
});

onUnmounted(() => {
  gameStore.disconnectFromGame();
});
</script>

<template>
  <div class="game-container">
    <p>Partie : <strong>{{ route.params.roomName }}</strong></p>
    <p>Joueur : <strong>{{ route.params.playerName }}</strong></p>
    <p>État : <strong :style="{ color: socketState.isConnected ? 'green' : 'red' }">{{ socketState.isConnected ? 'Connecté' : 'En cours de connexion...' }}</strong></p>
    
    <!-- Section Lobby -->
    <div v-if="gameStore.gameStatus === 'lobby'" class="lobby-container">
      <h3>En attente de joueurs...</h3>
      <ul>
        <li v-for="player in gameStore.playerList" :key="player.id">
          {{ player.name }} {{ player.isHost ? '(Hôte)' : '' }}
        </li>
      </ul>
      <button
        v-if="gameStore.isCurrentUserHost"
        @click="handleStartGame"
        class="start-button"
      >
        Démarrer la Partie
      </button>
      <p v-else>En attente que l'hôte démarre la partie.</p>
    </div>

    <!-- Section Jeu -->
    <GameBoard
      v-else-if="gameStore.gameStatus === 'playing'"
      :board="gameStore.board"
      :active-piece="gameStore.activePiece"
      @player-action="handlePlayerAction"
    />
  </div>
</template>

<style scoped>
.game-container {
  text-align: center;
  margin-top: 20px;
}

.lobby-container {
  border: 1px solid #ccc;
  background-color: #f9f9f9;
  padding: 20px;
  margin: 20px auto;
  max-width: 400px;
  border-radius: 8px;
}

.lobby-container ul {
  list-style-type: none;
  padding: 0;
}

.lobby-container li {
  margin: 5px 0;
  font-size: 1.1em;
}

.start-button {
  background-color: #4CAF50; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 10px 2px;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.start-button:hover {
  background-color: #45a049;
}
</style>
