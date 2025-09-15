<script setup>
import { onMounted, onUnmounted, ref, onBeforeUnmount, watch } from 'vue';
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

const handleRestartGame = () => {
  gameStore.sendRestartGame();
};

const handleLeaveGame = () => {
  gameStore.leaveGame();
  router.push('/menu');
};

// --- Auto-start logic for solo games ---
let stopWatchingHost = null;
if (route.query.solo === 'true') {
  // Watch for the player to become the host, then start the game automatically.
  stopWatchingHost = watch(
    () => gameStore.isCurrentUserHost,
    (isHost) => {
      if (isHost) {
        console.log('Auto-starting solo game...');
        gameStore.sendStartGame();
        if (stopWatchingHost) stopWatchingHost(); // Stop watching once the job is done.
      }
    }
  );
}
// -----------------------------------------

// onMounted s'exécute une seule fois lorsque le composant est monté.
// C'est le moment idéal pour rejoindre la partie, car la connexion
// globale est déjà gérée par App.vue.
onMounted(() => {
  const { roomName, playerName } = route.params;
  const isSpectator = route.query.spectate === 'true';
  if (roomName && playerName) {
    console.log(`Joining game '${roomName}' as '${playerName}' (Spectator: ${isSpectator})`);
    gameStore.connectAndJoin(roomName, playerName, isSpectator);
  }
});

onUnmounted(() => {
  gameStore.leaveGame();
  // Clean up the watcher if it was created
  if (stopWatchingHost) {
    stopWatchingHost();
  }
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
        <p v-if="gameStore.gameMode === 'solo' && gameStore.gameStatus !== 'finished'">Score : <strong>{{ gameStore.currentPlayer?.score || 0 }}</strong></p>
        <p>État : <strong :style="{ color: socketState.isConnected ? 'green' : 'red' }">{{ socketState.isConnected ? 'Connecté' : 'En cours de connexion...' }}</strong></p>
      </div>
      <button @click="handleLeaveGame" class="leave-button">Quitter</button>
    </div>

    <!-- Écran de fin de partie -->
    <div v-if="gameStore.gameStatus === 'finished'" class="game-over-container">
      <h2>Partie terminée !</h2>
      <p class="winner-message" v-if="gameStore.gameMode !== 'solo'">Le gagnant est : <strong>{{ gameStore.gameWinner }}</strong></p>

      <div v-if="gameStore.gameMode === 'solo'">
        <h3>Scores finaux</h3>
        <ul class="final-scores">
          <li v-for="player in gameStore.playerList" :key="player.id">
            {{ player.name }}: <strong>{{ player.score }} points</strong>
          </li>
        </ul>
      </div>

      <button @click="handleLeaveGame" class="leave-button">Retourner au menu</button>
      <button v-if="gameStore.isCurrentUserHost && gameStore.playerList.length > 1" @click="handleRestartGame" class="restart-button">Rejouer</button>
    </div>

    <!-- Section Lobby -->
    <div v-if="gameStore.gameStatus === 'lobby'" class="lobby-container">
      <h3>En attente de joueurs...</h3>
      <ul class="lobby-player-list">
        <li v-for="player in gameStore.playerList" :key="player.id">
          <span>{{ player.name }} {{ player.isHost ? '(Hôte)' : '' }}</span>
          <span v-if="gameStore.gameMode === 'solo'">Score: {{ player.score || 0 }}</span>
        </li>
      </ul>
      <button
        v-if="gameStore.isCurrentUserHost && gameStore.playerList.length > 1"
        @click="handleStartGame"
        class="start-button"
      >
        Démarrer la Partie
      </button>
      <p v-else-if="gameStore.isCurrentUserHost && gameStore.playerList.length <= 1">
        En attente d'autres joueurs...
      </p>
      <p v-else>En attente que l'hôte démarre la partie.</p>
    </div>

    <!-- Section Jeu (pour les joueurs) -->
    <div class="game-main-area" v-if="gameStore.gameStatus === 'playing' || (gameStore.gameStatus === 'finished' && gameStore.currentPlayer)">
      <!-- Main board for the current player -->
      <GameBoard
        :board="gameStore.board"
        :active-piece="gameStore.activePiece"
        @player-action="handlePlayerAction"
      />
      <!-- Spectator boards for multiplayer -->
      <MultiBoardGrid
        v-if="(gameStore.playerList?.length || 0) > 1"
        :players="gameStore.playerList.filter(p => p.id !== gameStore.currentPlayer.id)"
        :container-width="containerWidth"
      />
    </div>

    <!-- Section Spectateur -->
    <div v-if="gameStore.isCurrentUserSpectator" class="spectator-container">
      <h2>Mode Spectateur</h2>
      <p>Vous observez la partie. Voici les participants :</p>
      <div class="participant-lists">
        <div class="player-list">
          <h3>Joueurs</h3>
          <ul>
            <li v-for="player in gameStore.playerList" :key="player.id">
              {{ player.name }} {{ player.isHost ? '(Hôte)' : '' }}
            </li>
          </ul>
        </div>
        <div class="spectator-list">
          <h3>Spectateurs</h3>
          <ul>
            <li v-for="spectator in gameStore.spectatorList" :key="spectator.id">
              {{ spectator.name }}
            </li>
          </ul>
        </div>
      </div>
      <!-- À l'avenir, on pourrait afficher les plateaux de tous les joueurs ici -->
    </div>
  </div>
</template>

<style scoped>
.game-main-area {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 20px;
}

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
  display: flex;
  flex-direction: column;
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

.final-scores {
  list-style-type: none;
  padding: 0;
  margin-bottom: 20px;
}

.final-scores li {
  font-size: 1.1em;
  margin: 5px 0;
}

.lobby-player-list li {
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
}

.spectator-container {
  border: 2px dashed #007bff;
  background-color: #e7f3ff;
  padding: 20px;
  margin: 20px auto;
  border-radius: 8px;
  text-align: center;
}

.participant-lists {
  display: flex;
  justify-content: space-around;
  text-align: left;
}

.restart-button {
  background-color: #007bff;
  margin-left: 10px;
}

.restart-button:hover {
  background-color: #0069d9;
}
</style>
