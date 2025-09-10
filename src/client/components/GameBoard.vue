<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  CELL_EMPTY,
  TETROMINO_COLORS,
  ID_TO_TETROMINO,
} from '../../shared/constants.js';

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
  tileSize: {
    type: Number,
    required: false,
    default: 24,
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

// Dimensions de secours si le plateau n'est pas fourni
const cols = computed(() => (props.board?.[0]?.length ?? BOARD_WIDTH));
const rows = computed(() => (props.board?.length ?? BOARD_HEIGHT));

// Fusionne le plateau avec la pièce active (superposition)
const mergedGrid = computed(() => {
  const base = Array.from({ length: rows.value }, (_, y) => {
    return Array.from({ length: cols.value }, (_, x) => (props.board?.[y]?.[x] ?? CELL_EMPTY));
  });

  const piece = props.activePiece;
  if (!piece || !piece.shape || !piece.position) return base;

  const pieceKey = (piece.kind || piece.type || piece.id);
  const letter = typeof pieceKey === 'number' ? (ID_TO_TETROMINO[pieceKey] || 'T') : (pieceKey || 'T');

  for (let py = 0; py < piece.shape.length; py++) {
    for (let px = 0; px < piece.shape[py].length; px++) {
      const cell = piece.shape[py][px];
      if (!cell) continue;
      const gx = (piece.position.x || 0) + px;
      const gy = (piece.position.y || 0) + py;
      if (gy >= 0 && gy < rows.value && gx >= 0 && gx < cols.value) {
        base[gy][gx] = letter; // Marque avec la lettre du Tetrimino actif
      }
    }
  }
  return base;
});

function resolveCellColor(val) {
  if (!val || val === CELL_EMPTY) return 'transparent';
  if (typeof val === 'number') {
    const key = ID_TO_TETROMINO[val];
    return (key && TETROMINO_COLORS[key]) || '#777';
  }
  if (typeof val === 'string') {
    return TETROMINO_COLORS[val] || '#777';
  }
  if (typeof val === 'object' && val.color) return val.color;
  return '#777';
}
</script>

<template>
  <div class="game-board">
    <div class="board-grid" :style="{ '--cols': cols, '--rows': rows, '--tile-size': props.tileSize + 'px' }">
      <template v-for="(row, y) in mergedGrid" :key="y">
        <div
          v-for="(cell, x) in row"
          :key="x"
          class="tile"
          :style="{ backgroundColor: resolveCellColor(cell) }"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.game-board {
  border: 2px solid #333;
  padding: 8px;
  background-color: #0e0e0e;
}
.board-grid {
  --tile-size: 24px;
  display: grid;
  grid-template-columns: repeat(var(--cols), var(--tile-size));
  grid-template-rows: repeat(var(--rows), var(--tile-size));
  gap: 1px;
  background-color: #222;
}
.tile {
  width: var(--tile-size);
  height: var(--tile-size);
  background-color: transparent;
  border: 1px solid #111;
  box-sizing: border-box;
}
</style>
