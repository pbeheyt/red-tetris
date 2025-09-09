<script setup>
import { onMounted, onUnmounted } from 'vue';

// Contrat n°3 : "Câbles d'Entrée" (Props)
// Le composant attend de recevoir le plateau de jeu et la pièce active.
const props = defineProps({
  board: {
    type: Array,
    required: true,
    default: () => [],
  },
  activePiece: {
    type: Object,
    required: false,
    default: null,
  },
});

// Contrat n°3 : "Signaux de Sortie" (Emits)
// Le composant signale qu'une action du joueur doit être envoyée au serveur.
const emit = defineEmits(['playerAction']);

const handleKeydown = (event) => {
  let action = null;
  switch (event.key) {
    case 'ArrowLeft':
      action = 'moveLeft';
      break;
    case 'ArrowRight':
      action = 'moveRight';
      break;
    case 'ArrowUp':
      action = 'rotate';
      break;
    case 'ArrowDown':
      action = 'softDrop';
      break;
    case ' ': // Espace
      action = 'hardDrop';
      break;
  }

  if (action) {
    event.preventDefault();
    // Le composant ne modifie pas l'état lui-même, il émet un événement.
    emit('playerAction', action);
  }
};

// Ajoute et retire les écouteurs d'événements lorsque le composant est monté/démonté.
onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
  <div class="game-board">
    <p>Ceci est le plateau de jeu (GameBoard.vue).</p>
    <p>Appuyez sur les flèches ou la barre d'espace.</p>
    <div v-if="board.length === 0" class="placeholder">
      Le plateau est en cours de chargement...
    </div>
    <!-- Le rendu réel du plateau et de la pièce sera implémenté ici -->
  </div>
</template>

<style scoped>
.game-board {
  border: 2px solid #333;
  padding: 20px;
  background-color: #f0f0f0;
}
.placeholder {
  color: #888;
}
</style>
