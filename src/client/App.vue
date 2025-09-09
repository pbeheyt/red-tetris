<script setup>
import { ref } from 'vue';
import GameBoard from './components/GameBoard.vue';

// Données factices pour simuler ce qui viendra du serveur
const board = ref([
  // Un tableau 20x10 vide (0)
  ...Array(20).fill(Array(10).fill(0)),
]);

const activePiece = ref({
  shape: 'T',
  color: 'purple',
  position: { x: 4, y: 0 },
});

// Méthode pour gérer le "signal de sortie" du GameBoard
const handlePlayerAction = (action) => {
  console.log(`Action reçue de GameBoard : ${action}. Envoi au serveur...`);
  // Ici, on enverra l'action au serveur via socket.io
};
</script>

<template>
  <div class="app-container">
    <h1>Red Tetris</h1>
    <GameBoard
      :board="board"
      :active-piece="activePiece"
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
