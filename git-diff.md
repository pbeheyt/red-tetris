diff --git a/git-diff.md b/git-diff.md
index 2eaa410..e69de29 100644
--- a/git-diff.md
+++ b/git-diff.md
@@ -1,136 +0,0 @@
-diff --git a/src/client/stores/gameStore.js b/src/client/stores/gameStore.js
-index 67251c4..ffc4ae6 100644
---- a/src/client/stores/gameStore.js
-+++ b/src/client/stores/gameStore.js
-@@ -27,6 +27,9 @@ export const useGameStore = defineStore('game', () => {
-   // Renvoie la pièce active du joueur actuel
-   const activePiece = computed(() => currentPlayer.value?.activePiece || null);
- 
-+  // Renvoie la liste des prochaines pièces pour le joueur actuel
-+  const nextPieces = computed(() => currentPlayer.value?.nextPieces || []);
-+
-   // Renvoie le statut global de la partie
-   const gameStatus = computed(() => gameState.value?.status || 'disconnected');
- 
-@@ -249,6 +252,7 @@ export const useGameStore = defineStore('game', () => {
-     currentPlayer,
-     board,
-     activePiece,
-+    nextPieces,
-     gameStatus,
-     isCurrentUserHost,
-     playerList,
-diff --git a/src/client/views/GameView.vue b/src/client/views/GameView.vue
-index 27853a5..5ecf5d8 100644
---- a/src/client/views/GameView.vue
-+++ b/src/client/views/GameView.vue
-@@ -4,6 +4,7 @@ import { useRoute, useRouter } from 'vue-router';
- import { useGameStore } from '../stores/gameStore';
- import { state as socketState } from '../services/socketService.js';
- import GameBoard from '../components/GameBoard.vue';
-+import NextPieces from '../components/NextPieces.vue';
- import MultiBoardGrid from '../components/MultiBoardGrid.vue';
- import BaseButton from '../components/ui/BaseButton.vue';
- import BaseCard from '../components/ui/BaseCard.vue';
-@@ -167,17 +168,20 @@ onBeforeUnmount(() => window.removeEventListener('resize', updateWidth));
-         </div>
-       </div>
- 
--      <!-- Colonne Centrale: Plateau de jeu et Score -->
-+      <!-- Colonne Centrale: Plateau de jeu, pièces suivantes et Score -->
-       <div class="game-board-container">
-         <div class="score-display" v-if="gameStore.gameMode === 'solo'">
-           <span class="score-label">Score</span>
-           <span class="score-value">{{ gameStore.currentPlayer?.score || 0 }}</span>
-         </div>
--        <GameBoard
--          :board="gameStore.board"
--          :active-piece="gameStore.activePiece"
--          @player-action="handlePlayerAction"
--        />
-+        <div class="main-play-area">
-+          <GameBoard
-+            :board="gameStore.board"
-+            :active-piece="gameStore.activePiece"
-+            @player-action="handlePlayerAction"
-+          />
-+          <NextPieces :pieces="gameStore.nextPieces" />
-+        </div>
-       </div>
- 
-       <!-- Colonne de Droite: Adversaires -->
-@@ -271,6 +275,12 @@ onBeforeUnmount(() => window.removeEventListener('resize', updateWidth));
-   gap: 10px;
- }
- 
-+.main-play-area {
-+  display: flex;
-+  flex-direction: row;
-+  align-items: flex-start;
-+}
-+
- .score-display {
-   text-align: center;
- }
-diff --git a/src/server/models/Game.js b/src/server/models/Game.js
-index 9f0c079..a26cf5b 100644
---- a/src/server/models/Game.js
-+++ b/src/server/models/Game.js
-@@ -1,6 +1,7 @@
- import Player from './Player.js';
- import Piece from './Piece.js';
- import { addScore } from '../services/databaseService.js';
-+import { TETROMINOS } from '../../shared/tetriminos.js';
- import {
-   TETROMINO_IDS,
-   BOARD_WIDTH,
-@@ -562,17 +563,38 @@ class Game {
-       level: this.level,
-       linesToNextLevel: this.linesToNextLevel,
-       linesPerLevel: DIFFICULTY_SETTINGS[this.difficulty].linesPerLevel,
--      players: this.players.map(player => ({
--        id: player.id,
--        name: player.name,
--        isHost: player.isHost,
--        hasLost: player.hasLost,
--        score: player.score,
--        board: player.board,
--        activePiece: player.activePiece,
--        spectrum: this._calculateSpectrum(player),
--        nextPieces: [],
--      })),
-+      players: this.players.map(player => {
-+        const nextPieces = [];
-+        const nextPieceCount = 3; // How many pieces to show in advance
-+        for (let i = 0; i < nextPieceCount; i++) {
-+          const pieceIndex = player.pieceIndex + i;
-+          // Ensure the master sequence is long enough
-+          if (pieceIndex >= this.masterPieceSequence.length) {
-+            this._generateNewBag();
-+          }
-+          const pieceType = this.masterPieceSequence[pieceIndex];
-+          const tetromino = TETROMINOS[pieceType];
-+          if (tetromino) {
-+            nextPieces.push({
-+              type: pieceType,
-+              shape: tetromino.shape,
-+              color: tetromino.color,
-+            });
-+          }
-+        }
-+
-+        return {
-+          id: player.id,
-+          name: player.name,
-+          isHost: player.isHost,
-+          hasLost: player.hasLost,
-+          score: player.score,
-+          board: player.board,
-+          activePiece: player.activePiece,
-+          spectrum: this._calculateSpectrum(player),
-+          nextPieces: nextPieces,
-+        };
-+      }),
-       spectators: this.spectators,
-       events: [...this.events], // Envoie une copie des événements
-     };
diff --git a/src/client/App.spec.js b/src/client/App.spec.js
index 56d9694..569cf58 100644
--- a/src/client/App.spec.js
+++ b/src/client/App.spec.js
@@ -9,20 +9,16 @@ vi.mock('./stores/gameStore', () => {
   return { useGameStore: () => store, __storeMock: store }
 })
 
-vi.mock('./services/audioService', () => ({
-  audioService: { init: vi.fn() }
-}))
+const audioServiceMock = { init: vi.fn() };
+vi.mock('./services/audioService', () => audioServiceMock)
 
 import App from './App.vue'
 import { __storeMock } from './stores/gameStore'
-import { audioService } from './services/audioService'
 
 describe('App.vue', () => {
   test('calls initializeStore and audio init on mount', () => {
     mount(App, { global: { stubs: { 'router-view': true } } })
     expect(__storeMock.initializeStore).toHaveBeenCalled()
-    expect(audioService.init).toHaveBeenCalled()
+    expect(audioServiceMock.init).toHaveBeenCalled()
   })
 })
-
-
diff --git a/src/client/App.vue b/src/client/App.vue
index f27e345..659b6d9 100644
--- a/src/client/App.vue
+++ b/src/client/App.vue
@@ -1,7 +1,7 @@
 <script setup>
 import { onMounted } from 'vue';
 import { useGameStore } from './stores/gameStore';
-import { audioService } from './services/audioService';
+import { init as initAudioService } from './services/audioService';
 
 // Le composant App.vue est la "coquille" principale de l'application.
 // C'est le meilleur endroit pour initialiser des services globaux comme le store de jeu.
@@ -13,7 +13,7 @@ const gameStore = useGameStore();
 // pendant toute la durée de vie de l'application.
 onMounted(() => {
   gameStore.initializeStore();
-  audioService.init();
+  initAudioService();
 });
 </script>
 
diff --git a/src/client/services/__tests__/audioService.spec.js b/src/client/services/__tests__/audioService.spec.js
index 5d322b2..012ae63 100644
--- a/src/client/services/__tests__/audioService.spec.js
+++ b/src/client/services/__tests__/audioService.spec.js
@@ -8,7 +8,7 @@ class MockAudio {
 }
 vi.stubGlobal('Audio', MockAudio)
 
-import { audioService } from '../audioService.js'
+import * as audioService from '../audioService.js'
 
 describe('audioService', () => {
   beforeEach(() => {
@@ -30,5 +30,3 @@ describe('audioService', () => {
     expect(spy).toHaveBeenCalled()
   })
 })
-
-
diff --git a/src/client/services/audioService.js b/src/client/services/audioService.js
index 8354ce7..9caab45 100644
--- a/src/client/services/audioService.js
+++ b/src/client/services/audioService.js
@@ -10,59 +10,56 @@ import gameOverSoundSrc from '../assets/sounds/game-over.mp3';
 // Un objet pour contenir les instances Audio
 const sounds = {};
 
-// L'API publique du service audio
-export const audioService = {
-  /**
-   * Initialise le service en créant et chargeant les éléments audio.
-   * Doit être appelée une seule fois au démarrage de l'application.
-   */
-  init() {
-    console.log('Initializing Audio Service...');
-    sounds.move = new Audio(moveSoundSrc);
-    sounds.rotate = new Audio(rotateSoundSrc);
-    sounds.hardDrop = new Audio(hardDropSoundSrc);
-    sounds.lineClear = new Audio(lineClearSoundSrc);
-    sounds.gameOver = new Audio(gameOverSoundSrc);
-
-    // Optionnel : Régler des propriétés globales comme le volume
-    Object.values(sounds).forEach(sound => {
-      sound.volume = 0.4; // Volume à 40%
+/**
+ * Méthode interne pour jouer un son.
+ * Réinitialise le temps du son pour permettre des lectures rapides et successives.
+ * @param {HTMLAudioElement} sound L'objet audio à jouer.
+ */
+function _playSound(sound) {
+  if (sound) {
+    sound.currentTime = 0;
+    sound.play().catch(error => {
+      // La lecture automatique a été bloquée par le navigateur.
+      // C'est normal avant la première interaction de l'utilisateur.
+      console.warn('La lecture du son a été empêchée :', error.message);
     });
-  },
+  }
+}
+
+/**
+ * Initialise le service en créant et chargeant les éléments audio.
+ * Doit être appelée une seule fois au démarrage de l'application.
+ */
+export function init() {
+  console.log('Initializing Audio Service...');
+  sounds.move = new Audio(moveSoundSrc);
+  sounds.rotate = new Audio(rotateSoundSrc);
+  sounds.hardDrop = new Audio(hardDropSoundSrc);
+  sounds.lineClear = new Audio(lineClearSoundSrc);
+  sounds.gameOver = new Audio(gameOverSoundSrc);
 
-  /**
-   * Méthode interne pour jouer un son.
-   * Réinitialise le temps du son pour permettre des lectures rapides et successives.
-   * @param {HTMLAudioElement} sound L'objet audio à jouer.
-   */
-  _playSound(sound) {
-    if (sound) {
-      sound.currentTime = 0;
-      sound.play().catch(error => {
-        // La lecture automatique a été bloquée par le navigateur.
-        // C'est normal avant la première interaction de l'utilisateur.
-        console.warn('La lecture du son a été empêchée :', error.message);
-      });
-    }
-  },
+  // Optionnel : Régler des propriétés globales comme le volume
+  Object.values(sounds).forEach(sound => {
+    sound.volume = 0.4; // Volume à 40%
+  });
+}
 
-  playMove() {
-    this._playSound(sounds.move);
-  },
+export function playMove() {
+  _playSound(sounds.move);
+}
 
-  playRotate() {
-    this._playSound(sounds.rotate);
-  },
+export function playRotate() {
+  _playSound(sounds.rotate);
+}
 
-  playHardDrop() {
-    this._playSound(sounds.hardDrop);
-  },
+export function playHardDrop() {
+  _playSound(sounds.hardDrop);
+}
 
-  playLineClear() {
-    this._playSound(sounds.lineClear);
-  },
+export function playLineClear() {
+  _playSound(sounds.lineClear);
+}
 
-  playGameOver() {
-    this._playSound(sounds.gameOver);
-  },
-};
+export function playGameOver() {
+  _playSound(sounds.gameOver);
+}
diff --git a/src/client/stores/gameStore.js b/src/client/stores/gameStore.js
index ffc4ae6..e2b187c 100644
--- a/src/client/stores/gameStore.js
+++ b/src/client/stores/gameStore.js
@@ -1,7 +1,7 @@
 import { defineStore } from 'pinia';
 import { ref, computed } from 'vue';
 import { socketService, state as socketState } from '../services/socketService.js';
-import { audioService } from '../services/audioService.js';
+import * as audioService from '../services/audioService.js';
 
 export const useGameStore = defineStore('game', () => {
   // --- STATE ---
diff --git a/src/client/stores/gameStore.test.js b/src/client/stores/gameStore.test.js
index f0a5863..443f134 100644
--- a/src/client/stores/gameStore.test.js
+++ b/src/client/stores/gameStore.test.js
@@ -22,18 +22,16 @@ vi.mock('../services/socketService.js', () => ({
 
 // Mock audio service to validate event-driven sounds
 vi.mock('../services/audioService.js', () => ({
-  audioService: {
-    playMove: vi.fn(),
-    playRotate: vi.fn(),
-    playHardDrop: vi.fn(),
-    playLineClear: vi.fn(),
-    playGameOver: vi.fn(),
-  }
+  playMove: vi.fn(),
+  playRotate: vi.fn(),
+  playHardDrop: vi.fn(),
+  playLineClear: vi.fn(),
+  playGameOver: vi.fn(),
 }));
 
 // On importe le service mocké APRES la configuration du mock.
 import { socketService, state as socketState } from '../services/socketService.js';
-import { audioService } from '../services/audioService.js';
+import * as audioService from '../services/audioService.js';
 
 describe('Game Store', () => {
 
diff --git a/src/client/stores/userStore.js b/src/client/stores/userStore.js
index f21a5b1..ca7b6f3 100644
--- a/src/client/stores/userStore.js
+++ b/src/client/stores/userStore.js
@@ -1,13 +1,19 @@
 import { defineStore } from 'pinia';
+import { ref } from 'vue';
 
-export const useUserStore = defineStore('user', {
-  state: () => ({
-    playerName: localStorage.getItem('playerName') || '',
-  }),
-  actions: {
-    setPlayerName(name) {
-      this.playerName = name;
-      localStorage.setItem('playerName', name);
-    },
-  },
+export const useUserStore = defineStore('user', () => {
+  // --- STATE ---
+  const playerName = ref(localStorage.getItem('playerName') || '');
+
+  // --- ACTION ---
+  function setPlayerName(name) {
+    playerName.value = name.trim();
+    localStorage.setItem('playerName', name.trim());
+  }
+
+  // --- EXPOSITION ---
+  return {
+    playerName,
+    setPlayerName,
+  };
 });
