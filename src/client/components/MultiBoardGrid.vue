<script setup>
import { computed } from 'vue';
import GameBoard from './GameBoard.vue';
import { BOARD_WIDTH, BOARD_HEIGHT, MIN_TILE_PX, MAX_TILE_PX } from '../../shared/constants.js';

const props = defineProps({
  players: { type: Array, required: true, default: () => [] },
  containerWidth: { type: Number, required: true },
});

// Compute responsive columns based on number of players (1..4) to avoid horizontal scroll
// 1 player: 1 col, 2: 2 cols, 3-4: 2 cols
const cols = computed(() => {
  const n = Math.max(1, Math.min(4, props.players.length));
  if (n === 1) return 1;
  if (n === 2) return 2;
  return 2; // 3 or 4 players in 2 columns
});

// Tile size calculation: fit all boards within container width without horizontal scroll.
const tileSize = computed(() => {
  const boardsPerRow = cols.value;
  const gaps = (boardsPerRow + 1) * 8; // 8px padding/gap heuristic
  const usable = Math.max(0, props.containerWidth - gaps);
  const boardPixelWidth = Math.floor(usable / boardsPerRow);
  const size = Math.floor(boardPixelWidth / BOARD_WIDTH);
  return Math.max(MIN_TILE_PX, Math.min(MAX_TILE_PX, size));
});
</script>

<template>
  <div class="grid" :style="{ gridTemplateColumns: `repeat(${cols}, 1fr)` }">
    <div v-for="p in players" :key="p.id" class="cell">
      <div class="player-name">{{ p.name }}</div>
      <GameBoard :board="p.board || []" :active-piece="p.activePiece || null" :tile-size="tileSize" />
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-gap: 12px;
}
.cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.player-name {
  margin-bottom: 6px;
  color: #ddd;
  font-size: 14px;
}
</style>


