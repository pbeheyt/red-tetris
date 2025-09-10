<script setup>
import { onMounted, onUnmounted, ref, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { state as socketState } from '../services/socketService.js';
import GameBoard from '../components/GameBoard.vue';
import MultiBoardGrid from '../components/MultiBoardGrid.vue';

const gameStore = useGameStore();
const route = useRoute();
const router = useRouter();

const handlePlayerAction = (action) => {
  gameStore.sendPlayerAction(action);
};

const handleStartGame = () => {
  gameStore.sendStartGame();
};

const handleLeaveGame = () => {
  gameStore.leaveGame();
  router.push('/menu');
};

// onMounted s'exécute une seule fois lorsque le composant est monté.
// C'est le moment idéal pour rejoindre la partie, car la connexion
// globale est déjà gérée par App.vue.
onMounted(() => {
  const { roomName, playerName } = route.params;
  if (roomName && playerName) {
    console.log(`Joining game '${roomName}' as '${playerName}'`);
    gameStore.connectAndJoin(roomName, playerName);
  }
});

onUnmounted(() => {
  gameStore.leaveGame();
});

// Responsive width tracking for MultiBoardGrid (to avoid horizontal scrolling)
const containerRef = ref(null);
const containerWidth = ref(0);
function updateWidth() {
  containerWidth.value = containerRef.value?.clientWidth || 0;
}
window.addEventListener('resize', updateWidth);
onMounted(updateWidth);
onBeforeUnmount(() => window.removeEventListener('resize', updateWidth));
</script>

<template>
  <div class="game-container" ref="containerRef">
    <div class="game-header">
      <div>
        <p>Partie : <strong>{{ route.params.roomName }}</strong></p>
        <p>Joueur : <strong>{{ route.params.playerName }}</strong></p>
        <p>État : <strong :style="{ color: socketState.isConnected ? 'green' : 'red' }">{{ socketState.isConnected ? 'Connecté' : 'En cours de connexion...' }}</strong></p>
      </div>
      <button @click="handleLeaveGame" class="leave-button">Quitter</button>
    </div>

    <!-- Écran de fin de partie -->
    <div v-if="gameStore.gameStatus === 'finished'" class="game-over-container">
      <h2>Partie terminée !</h2>
      <p class="winner-message">Le gagnant est : <strong>{{ gameStore.gameWinner }}</strong></p>
      <button @click="handleLeaveGame" class="leave-button">Retourner au menu</button>
    </div>

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
    <template v-if="gameStore.gameStatus === 'playing' || (gameStore.gameStatus === 'finished' && gameStore.currentPlayer)">
      <!-- Multi-board view if more than one player -->
      <MultiBoardGrid
        v-if="(gameStore.playerList?.length || 0) > 1"
        :players="gameStore.playerList"
        :container-width="containerWidth"
      />
      <!-- Single board fallback -->
      <GameBoard
        v-else
        :board="gameStore.board"
        :active-piece="gameStore.activePiece"
        @player-action="handlePlayerAction"
      />
    </template>
  </div>
</template>

<style scoped>
.game-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  text-align: left;
  margin-bottom: 20px;
}

.game-header p {
  margin: 0;
}

.leave-button {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

.leave-button:hover {
  background-color: #c82333;
}

.game-over-container {
  border: 2px solid #ffc107;
  background-color: #fff3cd;
  padding: 20px;
  margin: 20px auto;
  max-width: 500px;
  border-radius: 8px;
  text-align: center;
}

.winner-message {
  font-size: 1.2em;
  margin-bottom: 20px;
}

.game-container {
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
