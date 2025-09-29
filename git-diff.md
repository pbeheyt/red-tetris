diff --git a/src/client/stores/gameStore.js b/src/client/stores/gameStore.js
index 67251c4..ffc4ae6 100644
--- a/src/client/stores/gameStore.js
+++ b/src/client/stores/gameStore.js
@@ -27,6 +27,9 @@ export const useGameStore = defineStore('game', () => {
   // Renvoie la pièce active du joueur actuel
   const activePiece = computed(() => currentPlayer.value?.activePiece || null);
 
+  // Renvoie la liste des prochaines pièces pour le joueur actuel
+  const nextPieces = computed(() => currentPlayer.value?.nextPieces || []);
+
   // Renvoie le statut global de la partie
   const gameStatus = computed(() => gameState.value?.status || 'disconnected');
 
@@ -249,6 +252,7 @@ export const useGameStore = defineStore('game', () => {
     currentPlayer,
     board,
     activePiece,
+    nextPieces,
     gameStatus,
     isCurrentUserHost,
     playerList,
diff --git a/src/client/views/GameView.vue b/src/client/views/GameView.vue
index 27853a5..5ecf5d8 100644
--- a/src/client/views/GameView.vue
+++ b/src/client/views/GameView.vue
@@ -4,6 +4,7 @@ import { useRoute, useRouter } from 'vue-router';
 import { useGameStore } from '../stores/gameStore';
 import { state as socketState } from '../services/socketService.js';
 import GameBoard from '../components/GameBoard.vue';
+import NextPieces from '../components/NextPieces.vue';
 import MultiBoardGrid from '../components/MultiBoardGrid.vue';
 import BaseButton from '../components/ui/BaseButton.vue';
 import BaseCard from '../components/ui/BaseCard.vue';
@@ -167,17 +168,20 @@ onBeforeUnmount(() => window.removeEventListener('resize', updateWidth));
         </div>
       </div>
 
-      <!-- Colonne Centrale: Plateau de jeu et Score -->
+      <!-- Colonne Centrale: Plateau de jeu, pièces suivantes et Score -->
       <div class="game-board-container">
         <div class="score-display" v-if="gameStore.gameMode === 'solo'">
           <span class="score-label">Score</span>
           <span class="score-value">{{ gameStore.currentPlayer?.score || 0 }}</span>
         </div>
-        <GameBoard
-          :board="gameStore.board"
-          :active-piece="gameStore.activePiece"
-          @player-action="handlePlayerAction"
-        />
+        <div class="main-play-area">
+          <GameBoard
+            :board="gameStore.board"
+            :active-piece="gameStore.activePiece"
+            @player-action="handlePlayerAction"
+          />
+          <NextPieces :pieces="gameStore.nextPieces" />
+        </div>
       </div>
 
       <!-- Colonne de Droite: Adversaires -->
@@ -271,6 +275,12 @@ onBeforeUnmount(() => window.removeEventListener('resize', updateWidth));
   gap: 10px;
 }
 
+.main-play-area {
+  display: flex;
+  flex-direction: row;
+  align-items: flex-start;
+}
+
 .score-display {
   text-align: center;
 }
diff --git a/src/server/models/Game.js b/src/server/models/Game.js
index 9f0c079..a26cf5b 100644
--- a/src/server/models/Game.js
+++ b/src/server/models/Game.js
@@ -1,6 +1,7 @@
 import Player from './Player.js';
 import Piece from './Piece.js';
 import { addScore } from '../services/databaseService.js';
+import { TETROMINOS } from '../../shared/tetriminos.js';
 import {
   TETROMINO_IDS,
   BOARD_WIDTH,
@@ -562,17 +563,38 @@ class Game {
       level: this.level,
       linesToNextLevel: this.linesToNextLevel,
       linesPerLevel: DIFFICULTY_SETTINGS[this.difficulty].linesPerLevel,
-      players: this.players.map(player => ({
-        id: player.id,
-        name: player.name,
-        isHost: player.isHost,
-        hasLost: player.hasLost,
-        score: player.score,
-        board: player.board,
-        activePiece: player.activePiece,
-        spectrum: this._calculateSpectrum(player),
-        nextPieces: [],
-      })),
+      players: this.players.map(player => {
+        const nextPieces = [];
+        const nextPieceCount = 3; // How many pieces to show in advance
+        for (let i = 0; i < nextPieceCount; i++) {
+          const pieceIndex = player.pieceIndex + i;
+          // Ensure the master sequence is long enough
+          if (pieceIndex >= this.masterPieceSequence.length) {
+            this._generateNewBag();
+          }
+          const pieceType = this.masterPieceSequence[pieceIndex];
+          const tetromino = TETROMINOS[pieceType];
+          if (tetromino) {
+            nextPieces.push({
+              type: pieceType,
+              shape: tetromino.shape,
+              color: tetromino.color,
+            });
+          }
+        }
+
+        return {
+          id: player.id,
+          name: player.name,
+          isHost: player.isHost,
+          hasLost: player.hasLost,
+          score: player.score,
+          board: player.board,
+          activePiece: player.activePiece,
+          spectrum: this._calculateSpectrum(player),
+          nextPieces: nextPieces,
+        };
+      }),
       spectators: this.spectators,
       events: [...this.events], // Envoie une copie des événements
     };
