<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '../stores/gameStore';
import { state as socketState } from '../services/socketService.js';
import GameBoard from '../components/GameBoard.vue';

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
  const isSpectator = route.query.spectate === 'true';
  if (roomName && playerName) {
    console.log(`Joining game '${roomName}' as '${playerName}' (Spectator: ${isSpectator})`);
    gameStore.connectAndJoin(roomName, playerName, isSpectator);
  }
});

onUnmounted(() => {
  gameStore.leaveGame();
});
</script>

<template>
  <div class="game-container">
    <div class="game-header">
      <div>
        <p>Partie : <strong>{{ route.params.roomName }}</strong></p>
        <p>Joueur : <strong>{{ route.params.playerName }}</strong></p>
        <p>État : <strong :style="{ color: socketState.isConnected ? 'green' : 'red' }">{{ socketState.isConnected ? 'Connecté' : 'En cours de connexion...' }}</strong></p>
      </div>
      <button @click="handleLeaveGame" class="leave-button">Quitter</button>
    </div>

    <!-- Écran de fin de partie -->
    <!-- Écran de fin de partie -->
    <div v-if="gameStore.gameStatus === 'finished'" class="game-over-container">
      <h2>Partie terminée !</h2>
      <p class="winner-message">Le gagnant est : <strong>{{ gameStore.gameWinner }}</strong></p>
      
      <h3>Scores finaux</h3>
      <ul class="final-scores">
        <li v-for="player in gameStore.playerList" :key="player.id">
          {{ player.name }}: <strong>{{ player.score }} points</strong>
        </li>
      </ul>

      <button @click="handleLeaveGame" class="leave-button">Retourner au menu</button>
    </div>
    
    <!-- Section Lobby -->
    <div v-if="gameStore.gameStatus === 'lobby'" class="lobby-container">
      <h3>En attente de joueurs...</h3>
      <ul class="lobby-player-list">
        <li v-for="player in gameStore.playerList" :key="player.id">
          <span>{{ player.name }} {{ player.isHost ? '(Hôte)' : '' }}</span>
          <span>Score: {{ player.score || 0 }}</span>
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

    <!-- Section Jeu (pour les joueurs) -->
    <div v-if="!gameStore.isCurrentUserSpectator">
      <GameBoard
        v-if="gameStore.gameStatus === 'playing' || (gameStore.gameStatus === 'finished' && gameStore.currentPlayer)"
        :board="gameStore.board"
        :active-piece="gameStore.activePiece"
        @player-action="handlePlayerAction"
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
</style>
