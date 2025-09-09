<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useGameStore } from './stores/gameStore';
import GameBoard from './components/GameBoard.vue';

// Initialise le store Pinia qui gère l'état du jeu et la communication socket.
const gameStore = useGameStore();

// La méthode pour gérer le "signal de sortie" de GameBoard est maintenant connectée au store.
const handlePlayerAction = (action) => {
  console.log(`Action reçue de GameBoard : ${action}. Envoi au store...`);
  gameStore.sendPlayerAction(action);
};

// Le cycle de vie du composant gère l'initialisation et le nettoyage de la connexion.
onMounted(() => {
  gameStore.initializeSocket();
});

onUnmounted(() => {
  gameStore.disconnectSocket();
});
</script>

<template>
  <div class="app-container">
    <h1>Red Tetris</h1>
    <GameBoard
      :board="gameStore.board"
      :active-piece="gameStore.activePiece"
      @player-action="handlePlayerAction"
    />
  </div>
</template>

<style scoped>
.app-container {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 50px;
  color: #333;
}
</style>
