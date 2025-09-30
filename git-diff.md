diff --git a/git-diff.md b/git-diff.md
index d120c01..e69de29 100644
--- a/git-diff.md
+++ b/git-diff.md
@@ -1,396 +0,0 @@
-diff --git a/git-diff.md b/git-diff.md
-index 2eaa410..e69de29 100644
---- a/git-diff.md
-+++ b/git-diff.md
-@@ -1,136 +0,0 @@
--diff --git a/src/client/stores/gameStore.js b/src/client/stores/gameStore.js
--index 67251c4..ffc4ae6 100644
----- a/src/client/stores/gameStore.js
--+++ b/src/client/stores/gameStore.js
--@@ -27,6 +27,9 @@ export const useGameStore = defineStore('game', () => {
--   // Renvoie la pièce active du joueur actuel
--   const activePiece = computed(() => currentPlayer.value?.activePiece || null);
-- 
--+  // Renvoie la liste des prochaines pièces pour le joueur actuel
--+  const nextPieces = computed(() => currentPlayer.value?.nextPieces || []);
--+
--   // Renvoie le statut global de la partie
--   const gameStatus = computed(() => gameState.value?.status || 'disconnected');
-- 
--@@ -249,6 +252,7 @@ export const useGameStore = defineStore('game', () => {
--     currentPlayer,
--     board,
--     activePiece,
--+    nextPieces,
--     gameStatus,
--     isCurrentUserHost,
--     playerList,
--diff --git a/src/client/views/GameView.vue b/src/client/views/GameView.vue
--index 27853a5..5ecf5d8 100644
----- a/src/client/views/GameView.vue
--+++ b/src/client/views/GameView.vue
--@@ -4,6 +4,7 @@ import { useRoute, useRouter } from 'vue-router';
-- import { useGameStore } from '../stores/gameStore';
-- import { state as socketState } from '../services/socketService.js';
-- import GameBoard from '../components/GameBoard.vue';
--+import NextPieces from '../components/NextPieces.vue';
-- import MultiBoardGrid from '../components/MultiBoardGrid.vue';
-- import BaseButton from '../components/ui/BaseButton.vue';
-- import BaseCard from '../components/ui/BaseCard.vue';
--@@ -167,17 +168,20 @@ onBeforeUnmount(() => window.removeEventListener('resize', updateWidth));
--         </div>
--       </div>
-- 
---      <!-- Colonne Centrale: Plateau de jeu et Score -->
--+      <!-- Colonne Centrale: Plateau de jeu, pièces suivantes et Score -->
--       <div class="game-board-container">
--         <div class="score-display" v-if="gameStore.gameMode === 'solo'">
--           <span class="score-label">Score</span>
--           <span class="score-value">{{ gameStore.currentPlayer?.score || 0 }}</span>
--         </div>
---        <GameBoard
---          :board="gameStore.board"
---          :active-piece="gameStore.activePiece"
---          @player-action="handlePlayerAction"
---        />
--+        <div class="main-play-area">
--+          <GameBoard
--+            :board="gameStore.board"
--+            :active-piece="gameStore.activePiece"
--+            @player-action="handlePlayerAction"
--+          />
--+          <NextPieces :pieces="gameStore.nextPieces" />
--+        </div>
--       </div>
-- 
--       <!-- Colonne de Droite: Adversaires -->
--@@ -271,6 +275,12 @@ onBeforeUnmount(() => window.removeEventListener('resize', updateWidth));
--   gap: 10px;
-- }
-- 
--+.main-play-area {
--+  display: flex;
--+  flex-direction: row;
--+  align-items: flex-start;
--+}
--+
-- .score-display {
--   text-align: center;
-- }
--diff --git a/src/server/models/Game.js b/src/server/models/Game.js
--index 9f0c079..a26cf5b 100644
----- a/src/server/models/Game.js
--+++ b/src/server/models/Game.js
--@@ -1,6 +1,7 @@
-- import Player from './Player.js';
-- import Piece from './Piece.js';
-- import { addScore } from '../services/databaseService.js';
--+import { TETROMINOS } from '../../shared/tetriminos.js';
-- import {
--   TETROMINO_IDS,
--   BOARD_WIDTH,
--@@ -562,17 +563,38 @@ class Game {
--       level: this.level,
--       linesToNextLevel: this.linesToNextLevel,
--       linesPerLevel: DIFFICULTY_SETTINGS[this.difficulty].linesPerLevel,
---      players: this.players.map(player => ({
---        id: player.id,
---        name: player.name,
---        isHost: player.isHost,
---        hasLost: player.hasLost,
---        score: player.score,
---        board: player.board,
---        activePiece: player.activePiece,
---        spectrum: this._calculateSpectrum(player),
---        nextPieces: [],
---      })),
--+      players: this.players.map(player => {
--+        const nextPieces = [];
--+        const nextPieceCount = 3; // How many pieces to show in advance
--+        for (let i = 0; i < nextPieceCount; i++) {
--+          const pieceIndex = player.pieceIndex + i;
--+          // Ensure the master sequence is long enough
--+          if (pieceIndex >= this.masterPieceSequence.length) {
--+            this._generateNewBag();
--+          }
--+          const pieceType = this.masterPieceSequence[pieceIndex];
--+          const tetromino = TETROMINOS[pieceType];
--+          if (tetromino) {
--+            nextPieces.push({
--+              type: pieceType,
--+              shape: tetromino.shape,
--+              color: tetromino.color,
--+            });
--+          }
--+        }
--+
--+        return {
--+          id: player.id,
--+          name: player.name,
--+          isHost: player.isHost,
--+          hasLost: player.hasLost,
--+          score: player.score,
--+          board: player.board,
--+          activePiece: player.activePiece,
--+          spectrum: this._calculateSpectrum(player),
--+          nextPieces: nextPieces,
--+        };
--+      }),
--       spectators: this.spectators,
--       events: [...this.events], // Envoie une copie des événements
--     };
-diff --git a/src/client/App.spec.js b/src/client/App.spec.js
-index 56d9694..569cf58 100644
---- a/src/client/App.spec.js
-+++ b/src/client/App.spec.js
-@@ -9,20 +9,16 @@ vi.mock('./stores/gameStore', () => {
-   return { useGameStore: () => store, __storeMock: store }
- })
- 
--vi.mock('./services/audioService', () => ({
--  audioService: { init: vi.fn() }
--}))
-+const audioServiceMock = { init: vi.fn() };
-+vi.mock('./services/audioService', () => audioServiceMock)
- 
- import App from './App.vue'
- import { __storeMock } from './stores/gameStore'
--import { audioService } from './services/audioService'
- 
- describe('App.vue', () => {
-   test('calls initializeStore and audio init on mount', () => {
-     mount(App, { global: { stubs: { 'router-view': true } } })
-     expect(__storeMock.initializeStore).toHaveBeenCalled()
--    expect(audioService.init).toHaveBeenCalled()
-+    expect(audioServiceMock.init).toHaveBeenCalled()
-   })
- })
--
--
-diff --git a/src/client/App.vue b/src/client/App.vue
-index f27e345..659b6d9 100644
---- a/src/client/App.vue
-+++ b/src/client/App.vue
-@@ -1,7 +1,7 @@
- <script setup>
- import { onMounted } from 'vue';
- import { useGameStore } from './stores/gameStore';
--import { audioService } from './services/audioService';
-+import { init as initAudioService } from './services/audioService';
- 
- // Le composant App.vue est la "coquille" principale de l'application.
- // C'est le meilleur endroit pour initialiser des services globaux comme le store de jeu.
-@@ -13,7 +13,7 @@ const gameStore = useGameStore();
- // pendant toute la durée de vie de l'application.
- onMounted(() => {
-   gameStore.initializeStore();
--  audioService.init();
-+  initAudioService();
- });
- </script>
- 
-diff --git a/src/client/services/__tests__/audioService.spec.js b/src/client/services/__tests__/audioService.spec.js
-index 5d322b2..012ae63 100644
---- a/src/client/services/__tests__/audioService.spec.js
-+++ b/src/client/services/__tests__/audioService.spec.js
-@@ -8,7 +8,7 @@ class MockAudio {
- }
- vi.stubGlobal('Audio', MockAudio)
- 
--import { audioService } from '../audioService.js'
-+import * as audioService from '../audioService.js'
- 
- describe('audioService', () => {
-   beforeEach(() => {
-@@ -30,5 +30,3 @@ describe('audioService', () => {
-     expect(spy).toHaveBeenCalled()
-   })
- })
--
--
-diff --git a/src/client/services/audioService.js b/src/client/services/audioService.js
-index 8354ce7..9caab45 100644
---- a/src/client/services/audioService.js
-+++ b/src/client/services/audioService.js
-@@ -10,59 +10,56 @@ import gameOverSoundSrc from '../assets/sounds/game-over.mp3';
- // Un objet pour contenir les instances Audio
- const sounds = {};
- 
--// L'API publique du service audio
--export const audioService = {
--  /**
--   * Initialise le service en créant et chargeant les éléments audio.
--   * Doit être appelée une seule fois au démarrage de l'application.
--   */
--  init() {
--    console.log('Initializing Audio Service...');
--    sounds.move = new Audio(moveSoundSrc);
--    sounds.rotate = new Audio(rotateSoundSrc);
--    sounds.hardDrop = new Audio(hardDropSoundSrc);
--    sounds.lineClear = new Audio(lineClearSoundSrc);
--    sounds.gameOver = new Audio(gameOverSoundSrc);
--
--    // Optionnel : Régler des propriétés globales comme le volume
--    Object.values(sounds).forEach(sound => {
--      sound.volume = 0.4; // Volume à 40%
-+/**
-+ * Méthode interne pour jouer un son.
-+ * Réinitialise le temps du son pour permettre des lectures rapides et successives.
-+ * @param {HTMLAudioElement} sound L'objet audio à jouer.
-+ */
-+function _playSound(sound) {
-+  if (sound) {
-+    sound.currentTime = 0;
-+    sound.play().catch(error => {
-+      // La lecture automatique a été bloquée par le navigateur.
-+      // C'est normal avant la première interaction de l'utilisateur.
-+      console.warn('La lecture du son a été empêchée :', error.message);
-     });
--  },
-+  }
-+}
-+
-+/**
-+ * Initialise le service en créant et chargeant les éléments audio.
-+ * Doit être appelée une seule fois au démarrage de l'application.
-+ */
-+export function init() {
-+  console.log('Initializing Audio Service...');
-+  sounds.move = new Audio(moveSoundSrc);
-+  sounds.rotate = new Audio(rotateSoundSrc);
-+  sounds.hardDrop = new Audio(hardDropSoundSrc);
-+  sounds.lineClear = new Audio(lineClearSoundSrc);
-+  sounds.gameOver = new Audio(gameOverSoundSrc);
- 
--  /**
--   * Méthode interne pour jouer un son.
--   * Réinitialise le temps du son pour permettre des lectures rapides et successives.
--   * @param {HTMLAudioElement} sound L'objet audio à jouer.
--   */
--  _playSound(sound) {
--    if (sound) {
--      sound.currentTime = 0;
--      sound.play().catch(error => {
--        // La lecture automatique a été bloquée par le navigateur.
--        // C'est normal avant la première interaction de l'utilisateur.
--        console.warn('La lecture du son a été empêchée :', error.message);
--      });
--    }
--  },
-+  // Optionnel : Régler des propriétés globales comme le volume
-+  Object.values(sounds).forEach(sound => {
-+    sound.volume = 0.4; // Volume à 40%
-+  });
-+}
- 
--  playMove() {
--    this._playSound(sounds.move);
--  },
-+export function playMove() {
-+  _playSound(sounds.move);
-+}
- 
--  playRotate() {
--    this._playSound(sounds.rotate);
--  },
-+export function playRotate() {
-+  _playSound(sounds.rotate);
-+}
- 
--  playHardDrop() {
--    this._playSound(sounds.hardDrop);
--  },
-+export function playHardDrop() {
-+  _playSound(sounds.hardDrop);
-+}
- 
--  playLineClear() {
--    this._playSound(sounds.lineClear);
--  },
-+export function playLineClear() {
-+  _playSound(sounds.lineClear);
-+}
- 
--  playGameOver() {
--    this._playSound(sounds.gameOver);
--  },
--};
-+export function playGameOver() {
-+  _playSound(sounds.gameOver);
-+}
-diff --git a/src/client/stores/gameStore.js b/src/client/stores/gameStore.js
-index ffc4ae6..e2b187c 100644
---- a/src/client/stores/gameStore.js
-+++ b/src/client/stores/gameStore.js
-@@ -1,7 +1,7 @@
- import { defineStore } from 'pinia';
- import { ref, computed } from 'vue';
- import { socketService, state as socketState } from '../services/socketService.js';
--import { audioService } from '../services/audioService.js';
-+import * as audioService from '../services/audioService.js';
- 
- export const useGameStore = defineStore('game', () => {
-   // --- STATE ---
-diff --git a/src/client/stores/gameStore.test.js b/src/client/stores/gameStore.test.js
-index f0a5863..443f134 100644
---- a/src/client/stores/gameStore.test.js
-+++ b/src/client/stores/gameStore.test.js
-@@ -22,18 +22,16 @@ vi.mock('../services/socketService.js', () => ({
- 
- // Mock audio service to validate event-driven sounds
- vi.mock('../services/audioService.js', () => ({
--  audioService: {
--    playMove: vi.fn(),
--    playRotate: vi.fn(),
--    playHardDrop: vi.fn(),
--    playLineClear: vi.fn(),
--    playGameOver: vi.fn(),
--  }
-+  playMove: vi.fn(),
-+  playRotate: vi.fn(),
-+  playHardDrop: vi.fn(),
-+  playLineClear: vi.fn(),
-+  playGameOver: vi.fn(),
- }));
- 
- // On importe le service mocké APRES la configuration du mock.
- import { socketService, state as socketState } from '../services/socketService.js';
--import { audioService } from '../services/audioService.js';
-+import * as audioService from '../services/audioService.js';
- 
- describe('Game Store', () => {
- 
-diff --git a/src/client/stores/userStore.js b/src/client/stores/userStore.js
-index f21a5b1..ca7b6f3 100644
---- a/src/client/stores/userStore.js
-+++ b/src/client/stores/userStore.js
-@@ -1,13 +1,19 @@
- import { defineStore } from 'pinia';
-+import { ref } from 'vue';
- 
--export const useUserStore = defineStore('user', {
--  state: () => ({
--    playerName: localStorage.getItem('playerName') || '',
--  }),
--  actions: {
--    setPlayerName(name) {
--      this.playerName = name;
--      localStorage.setItem('playerName', name);
--    },
--  },
-+export const useUserStore = defineStore('user', () => {
-+  // --- STATE ---
-+  const playerName = ref(localStorage.getItem('playerName') || '');
-+
-+  // --- ACTION ---
-+  function setPlayerName(name) {
-+    playerName.value = name.trim();
-+    localStorage.setItem('playerName', name.trim());
-+  }
-+
-+  // --- EXPOSITION ---
-+  return {
-+    playerName,
-+    setPlayerName,
-+  };
- });
diff --git a/src/client/services/audioService.js b/src/client/services/audioService.js
index 9caab45..2ff2462 100644
--- a/src/client/services/audioService.js
+++ b/src/client/services/audioService.js
@@ -1,5 +1,10 @@
 // @src/client/services/audioService.js
 
+import { createLogger } from '../../shared/logger.js';
+
+const log = createLogger('audioService');
+const logWarn = createLogger('audioService:warn');
+
 // Importation des fichiers sonores. Vite gère les chemins.
 import moveSoundSrc from '../assets/sounds/move.mp3';
 import rotateSoundSrc from '../assets/sounds/rotate.mp3';
@@ -21,7 +26,7 @@ function _playSound(sound) {
     sound.play().catch(error => {
       // La lecture automatique a été bloquée par le navigateur.
       // C'est normal avant la première interaction de l'utilisateur.
-      console.warn('La lecture du son a été empêchée :', error.message);
+      logWarn('La lecture du son a été empêchée :', error.message);
     });
   }
 }
@@ -31,7 +36,7 @@ function _playSound(sound) {
  * Doit être appelée une seule fois au démarrage de l'application.
  */
 export function init() {
-  console.log('Initializing Audio Service...');
+  log('Initializing Audio Service...');
   sounds.move = new Audio(moveSoundSrc);
   sounds.rotate = new Audio(rotateSoundSrc);
   sounds.hardDrop = new Audio(hardDropSoundSrc);
diff --git a/src/client/services/socketService.js b/src/client/services/socketService.js
index 285e5c6..2d65185 100644
--- a/src/client/services/socketService.js
+++ b/src/client/services/socketService.js
@@ -1,5 +1,8 @@
 import { reactive } from 'vue';
 import { io } from 'socket.io-client';
+import { createLogger } from '../../shared/logger.js';
+
+const log = createLogger('socketService');
 
 /**
  * L'état réactif du service, accessible par toute l'application.
@@ -17,13 +20,13 @@ const socket = io({
 
 // Les écouteurs fondamentaux qui mettent à jour l'état réactif.
 socket.on('connect', () => {
-  console.log(`Socket Service: Connected with ID ${socket.id}`);
+  log(`Connected with ID ${socket.id}`);
   state.isConnected = true;
   state.socketId = socket.id;
 });
 
 socket.on('disconnect', () => {
-  console.log('Socket Service: Disconnected');
+  log('Disconnected');
   state.isConnected = false;
   state.socketId = null;
 });
diff --git a/src/client/stores/gameStore.js b/src/client/stores/gameStore.js
index e2b187c..4fd2c36 100644
--- a/src/client/stores/gameStore.js
+++ b/src/client/stores/gameStore.js
@@ -2,6 +2,10 @@ import { defineStore } from 'pinia';
 import { ref, computed } from 'vue';
 import { socketService, state as socketState } from '../services/socketService.js';
 import * as audioService from '../services/audioService.js';
+import { createLogger } from '../../shared/logger.js';
+
+const log = createLogger('gameStore');
+const logWarn = createLogger('gameStore:warn');
 
 export const useGameStore = defineStore('game', () => {
   // --- STATE ---
@@ -104,7 +108,7 @@ export const useGameStore = defineStore('game', () => {
     });
 
     listenersRegistered.value = true;
-    console.log('GameStore: Listeners registered.');
+    log('Listeners registered.');
   }
 
   /**
@@ -113,10 +117,10 @@ export const useGameStore = defineStore('game', () => {
    */
   function initializeStore() {
     if (socketState.isConnected || listenersRegistered.value) {
-      console.log('Store already initialized.');
+      log('Store already initialized.');
       return;
     }
-    console.log('Initializing GameStore: Connecting and registering listeners...');
+    log('Initializing GameStore: Connecting and registering listeners...');
     registerGameListeners();
     socketService.connect();
   }
@@ -135,12 +139,12 @@ export const useGameStore = defineStore('game', () => {
     const joinPayload = { roomName, playerName, isSpectator, difficulty };
 
     if (socketState.isConnected) {
-      console.log('GameStore: Already connected, emitting joinGame.');
+      log('Already connected, emitting joinGame.');
       socketService.emit('joinGame', joinPayload);
     } else {
-      console.log('GameStore: Not connected. Queuing joinGame until connect event.');
+      log('Not connected. Queuing joinGame until connect event.');
       socketService.once('connect', () => {
-        console.log('GameStore: Connect event received, now emitting joinGame.');
+        log('Connect event received, now emitting joinGame.');
         socketService.emit('joinGame', joinPayload);
       });
     }
@@ -152,7 +156,7 @@ export const useGameStore = defineStore('game', () => {
    */
   function sendPlayerAction(action) {
     if (!socketState.isConnected) {
-      console.warn("Impossible d'envoyer l'action : non connecté.");
+      logWarn("Impossible d'envoyer l'action : non connecté.");
       return;
     }
     socketService.emit('playerAction', action);
@@ -163,7 +167,7 @@ export const useGameStore = defineStore('game', () => {
    */
   function sendStartGame() {
     if (!socketState.isConnected) {
-      console.warn("Impossible de démarrer la partie : non connecté.");
+      logWarn("Impossible de démarrer la partie : non connecté.");
       return;
     }
     socketService.emit('startGame');
@@ -174,7 +178,7 @@ export const useGameStore = defineStore('game', () => {
    */
   function sendRestartGame() {
     if (!socketState.isConnected) {
-      console.warn("Cannot restart game: not connected.");
+      logWarn("Cannot restart game: not connected.");
       return;
     }
     socketService.emit('restartGame');
@@ -210,12 +214,12 @@ export const useGameStore = defineStore('game', () => {
    */
   function enterLobbyBrowser() {
     if (socketState.isConnected) {
-      console.log('GameStore: Already connected, emitting enterLobbyBrowser.');
+      log('Already connected, emitting enterLobbyBrowser.');
       socketService.emit('enterLobbyBrowser');
     } else {
-      console.log('GameStore: Not connected. Queuing enterLobbyBrowser until connect event.');
+      log('Not connected. Queuing enterLobbyBrowser until connect event.');
       socketService.once('connect', () => {
-        console.log('GameStore: Connect event received, now emitting enterLobbyBrowser.');
+        log('Connect event received, now emitting enterLobbyBrowser.');
         socketService.emit('enterLobbyBrowser');
       });
     }
diff --git a/src/client/views/GameView.vue b/src/client/views/GameView.vue
index cb94d61..45aa6bc 100644
--- a/src/client/views/GameView.vue
+++ b/src/client/views/GameView.vue
@@ -1,6 +1,7 @@
 <script setup>
 import { onMounted, onUnmounted, ref, onBeforeUnmount, watch, computed } from 'vue';
 import { useRoute, useRouter } from 'vue-router';
+import { createLogger } from '../../shared/logger.js';
 import { useGameStore } from '../stores/gameStore';
 import { state as socketState } from '../services/socketService.js';
 import GameBoard from '../components/GameBoard.vue';
@@ -9,6 +10,7 @@ import MultiBoardGrid from '../components/MultiBoardGrid.vue';
 import BaseButton from '../components/ui/BaseButton.vue';
 import BaseCard from '../components/ui/BaseCard.vue';
 
+const log = createLogger('GameView');
 const gameStore = useGameStore();
 const route = useRoute();
 const router = useRouter();
@@ -92,7 +94,7 @@ if (route.query.solo === 'true') {
     () => gameStore.isCurrentUserHost,
     (isHost) => {
       if (isHost) {
-        console.log('Auto-starting solo game...');
+        log('Auto-starting solo game...');
         gameStore.sendStartGame();
         if (stopWatchingHost) stopWatchingHost(); // Stop watching once the job is done.
       }
@@ -105,7 +107,7 @@ if (route.query.solo === 'true') {
 watch(
   () => [gameStore.gameStatus, gameStore.isCurrentUserSpectator],
   ([status, isSpectator]) => {
-    console.log(`[Spectator Debug] Status: ${status}, IsSpectator: ${isSpectator}`);
+    log(`[Spectator Debug] Status: ${status}, IsSpectator: ${isSpectator}`);
   }
 );
 // ----------------------------------------
@@ -119,7 +121,7 @@ onMounted(() => {
   const difficulty = route.query.difficulty || 'normal'; // Fallback à 'normal' si absent
 
   if (roomName && playerName) {
-    console.log(`Joining game '${roomName}' as '${playerName}' (Spectator: ${isSpectator}, Difficulty: ${difficulty})`);
+    log(`Joining game '${roomName}' as '${playerName}' (Spectator: ${isSpectator}, Difficulty: ${difficulty})`);
     gameStore.connectAndJoin(roomName, playerName, { isSpectator, difficulty });
   }
 });
diff --git a/src/server/index.js b/src/server/index.js
index 461b804..f72a1f1 100644
--- a/src/server/index.js
+++ b/src/server/index.js
@@ -3,13 +3,13 @@ import express from 'express'
 import { Server } from 'socket.io'
 import Game from './models/Game.js'
 import { SERVER_TICK_RATE_MS } from '../shared/constants.js'
-import debug from 'debug'
+import { createLogger } from '../shared/logger.js'
 import path from 'path'
 import { fileURLToPath } from 'url'
 import { initializeDatabase, getLeaderboard } from './services/databaseService.js'
 
-const logerror = debug('tetris:error')
-const loginfo = debug('tetris:info')
+const logerror = createLogger('tetris:error')
+const loginfo = createLogger('tetris:info')
 
 const __filename = fileURLToPath(import.meta.url)
 const __dirname = path.dirname(__filename)
diff --git a/src/server/models/Game.js b/src/server/models/Game.js
index e25f6a0..7a834e9 100644
--- a/src/server/models/Game.js
+++ b/src/server/models/Game.js
@@ -88,7 +88,7 @@ class Game {
     // If the player is about to need a piece that doesn't exist yet, generate a new bag.
     if (player.pieceIndex >= this.masterPieceSequence.length) {
       this._generateNewBag();
-      console.log('Master piece sequence extended. New length:', this.masterPieceSequence.length);
+      // console.log('Master piece sequence extended. New length:', this.masterPieceSequence.length);
     }
 
     const pieceType = this.masterPieceSequence[player.pieceIndex];
@@ -193,7 +193,7 @@ class Game {
 
     if (linesCleared > 0) {
       this.events.push('lineClear');
-      console.log(`Player ${player.name} cleared ${linesCleared} lines.`);
+      // console.log(`Player ${player.name} cleared ${linesCleared} lines.`);
       // Add new empty rows at the top of the board for each line cleared
       for (let i = 0; i < linesCleared; i++) {
         newBoard.unshift(Array(BOARD_WIDTH).fill(0));
@@ -238,7 +238,7 @@ class Game {
         // Reset the counter, carrying over any extra lines
         const settings = DIFFICULTY_SETTINGS[this.difficulty];
         this.linesToNextLevel = settings.linesPerLevel + this.linesToNextLevel;
-        console.log(`Level up! Game is now level ${this.level}.`);
+        // console.log(`Level up! Game is now level ${this.level}.`);
       }
     }
   }
@@ -249,7 +249,7 @@ class Game {
    * @param {number} lineCount - The number of penalty lines to add.
    */
   _addPenaltyLines(player, lineCount) {
-    console.log(`Sending ${lineCount} penalty lines to player ${player.name}`);
+    // console.log(`Sending ${lineCount} penalty lines to player ${player.name}`);
     for (let i = 0; i < lineCount; i++) {
       // Remove the top line to make space
       player.board.shift();
@@ -332,7 +332,7 @@ class Game {
               player.hasLost = true;
               // Clear the active piece for the lost player so it doesn't render overlapping.
               player.activePiece = null;
-              console.log(`Player ${player.name} has lost the game.`);
+              // console.log(`Player ${player.name} has lost the game.`);
 
               const activePlayers = this.players.filter(p => !p.hasLost);
               if (activePlayers.length <= 1) {
@@ -373,7 +373,7 @@ class Game {
       }
     }
 
-    console.log(`Game finished. Winner: ${this.winner}. Saving scores...`);
+    // console.log(`Game finished. Winner: ${this.winner}. Saving scores...`);
 
     // Save the final, calculated scores.
     if (this.gameMode === 'solo') {
@@ -440,7 +440,7 @@ class Game {
       player.assignNewPiece(newPiece);
     });
 
-    console.log('Game has been restarted!');
+    // console.log('Game has been restarted!');
   }
 
   /**
@@ -622,17 +622,17 @@ class Game {
   addPlayer(playerInfo) {
     // Allow joining when the game is not actively playing (lobby or finished)
     if (this.status === 'playing') {
-      console.log(`Game is already playing. Cannot add player ${playerInfo.name}.`);
+      // console.log(`Game is already playing. Cannot add player ${playerInfo.name}.`);
       return false;
     }
     // Enforce a maximum of 4 players per game
     if (this.players.length >= 4) {
-      console.log(`Game is full (4/4). Cannot add player ${playerInfo.name}.`);
+      // console.log(`Game is full (4/4). Cannot add player ${playerInfo.name}.`);
       return false;
     }
     const newPlayer = new Player(playerInfo.id, playerInfo.name, false);
     this.players.push(newPlayer);
-    console.log(`Player ${playerInfo.name} added to the game. Total players: ${this.players.length}`);
+    // console.log(`Player ${playerInfo.name} added to the game. Total players: ${this.players.length}`);
     return true;
   }
 
@@ -644,7 +644,7 @@ class Game {
   addSpectator(spectatorInfo) {
     if (!this.spectators.some(s => s.id === spectatorInfo.id)) {
       this.spectators.push({ id: spectatorInfo.id, name: spectatorInfo.name });
-      console.log(`Spectator ${spectatorInfo.name} added. Total spectators: ${this.spectators.length}`);
+      // console.log(`Spectator ${spectatorInfo.name} added. Total spectators: ${this.spectators.length}`);
     }
     return true;
   }
@@ -661,12 +661,12 @@ class Game {
     const wasHost = playerToRemove.isHost;
 
     this.players = this.players.filter(p => p.id !== playerId);
-    console.log(`Player ${playerId} removed. Total players: ${this.players.length}`);
+    // console.log(`Player ${playerId} removed. Total players: ${this.players.length}`);
 
     // Si l'hôte est parti et qu'il reste des joueurs, le plus ancien devient le nouvel hôte.
     if (wasHost && this.players.length > 0) {
       this.players[0].isHost = true;
-      console.log(`Host migrated to player ${this.players[0].name} (${this.players[0].id}).`);
+      // console.log(`Host migrated to player ${this.players[0].name} (${this.players[0].id}).`);
     }
 
     // Si la partie était en cours et qu'il ne reste qu'un joueur, terminer proprement la partie
@@ -683,7 +683,7 @@ class Game {
    */
   removeSpectator(spectatorId) {
     this.spectators = this.spectators.filter(s => s.id !== spectatorId);
-    console.log(`Spectator ${spectatorId} removed. Total spectators: ${this.spectators.length}`);
+    // console.log(`Spectator ${spectatorId} removed. Total spectators: ${this.spectators.length}`);
   }
 
   /**
@@ -705,7 +705,7 @@ class Game {
       this._generateNewBag();
       this._generateNewBag();
 
-      console.log(`Game has started! Mode: ${this.gameMode}, Difficulty: ${this.difficulty}, Start Level: ${this.level}`);
+      // console.log(`Game has started! Mode: ${this.gameMode}, Difficulty: ${this.difficulty}, Start Level: ${this.level}`);
 
       // Assign the first piece to every player
       this.players.forEach(player => {
diff --git a/src/server/services/databaseService.js b/src/server/services/databaseService.js
index 1f10aec..3300e7a 100644
--- a/src/server/services/databaseService.js
+++ b/src/server/services/databaseService.js
@@ -2,10 +2,10 @@
 import sqlite3 from 'sqlite3';
 import { open } from 'sqlite';
 import path from 'path';
-import debug from 'debug';
+import { createLogger } from '../../shared/logger.js';
 
-const loginfo = debug('tetris:info');
-const logerror = debug('tetris:error');
+const loginfo = createLogger('tetris:info');
+const logerror = createLogger('tetris:error');
 
 // Le chemin vers le fichier de la base de données.
 // Il sera créé dans le répertoire racine du projet.
