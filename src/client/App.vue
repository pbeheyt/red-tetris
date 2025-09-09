<script setup>
import { ref, onUnmounted } from 'vue';
import { io } from 'socket.io-client';
import GameBoard from './components/GameBoard.vue';

// Initialise la connexion Socket.io.
// En développement, le proxy Vite redirigera cette requête vers le port 3004.
// En production, le client et le serveur seront sur le même domaine.
const socket = io();

// Log pour confirmer la connexion
socket.on('connect', () => {
  console.log(`Connecté au serveur avec l'ID : ${socket.id}`);
});

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
  // On envoie l'action au serveur via l'événement 'playerAction'.
  socket.emit('playerAction', action);
};

// Nettoie la connexion lorsque le composant est retiré
onUnmounted(() => {
  socket.disconnect();
});
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
