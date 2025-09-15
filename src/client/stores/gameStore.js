import { defineStore } from 'pinia';
import { socketService, state as socketState } from '../services/socketService.js';

export const useGameStore = defineStore('game', {
  /**
   * Le State contient la "photographie" complète de l'état du jeu.
   * @returns {{
   *   gameState: Object | null
   * }}
   */
  state: () => ({
    // L'objet GameState reçu du serveur, conforme au Contrat n°2
    gameState: null,
    // La liste des lobbies joignables
    lobbies: [],
    // Le classement des meilleurs scores
    leaderboard: [],
    // Drapeau pour s'assurer que les écouteurs ne sont enregistrés qu'une fois
    listenersRegistered: false,
  }),

  /**
   * Les Getters permettent d'accéder à des parties calculées ou spécifiques de l'état.
   */
  getters: {
    // Renvoie l'état du joueur actuel en se basant sur le socketId du service
    currentPlayer: (state) => {
      if (!state.gameState || !socketState.socketId) return null;
      return state.gameState.players.find(p => p.id === socketState.socketId);
    },
    // Renvoie le plateau de jeu du joueur actuel
    board: (state) => state.currentPlayer?.board || [],
    // Renvoie la pièce active du joueur actuel
    activePiece: (state) => state.currentPlayer?.activePiece || null,
    // Renvoie le statut global de la partie
    gameStatus: (state) => state.gameState?.status || 'disconnected',
    // Vérifie si le joueur actuel est l'hôte de la partie
    isCurrentUserHost: (state) => state.currentPlayer?.isHost || false,
    // Renvoie la liste de tous les joueurs dans la partie
    playerList: (state) => state.gameState?.players || [],
    // Returns the current game mode ('solo' or 'multiplayer')
    gameMode: (state) => state.gameState?.gameMode || 'multiplayer',
    // Renvoie le nom du gagnant si la partie est terminée
    gameWinner: (state) => state.gameState?.winner || null,
    // Renvoie la liste des spectateurs
    spectatorList: (state) => state.gameState?.spectators || [],
    // Vérifie si l'utilisateur actuel est un spectateur
    isCurrentUserSpectator: (state) => {
      if (!state.gameState || !socketState.socketId) return false;
      return state.gameState.spectators.some(s => s.id === socketState.socketId);
    },
  },

  /**
   * Les Actions sont les fonctions qui modifient l'état.
   */
  actions: {
    /**
     * S'abonne aux événements du jeu via le socketService.
     * Cette méthode est idempotent et peut être appelée plusieurs fois sans risque.
     */
    registerGameListeners() {
      // Garde pour s'assurer que les écouteurs ne sont enregistrés qu'une seule fois.
      if (this.listenersRegistered) return;

      // Met en place les écouteurs pour les événements spécifiques au jeu.
      socketService.on('gameStateUpdate', (newState) => {
        console.log('Received gameStateUpdate from server:', newState); // <-- DEBUG LOG
        this.gameState = newState;
      });

      // Écouteur pour la mise à jour de la liste des lobbies
      socketService.on('lobbiesListUpdate', (lobbiesList) => {
        this.lobbies = lobbiesList;
      });

      // Écouteur pour la mise à jour du leaderboard
      socketService.on('leaderboardUpdate', (leaderboardData) => {
        this.leaderboard = leaderboardData;
      });

      this.listenersRegistered = true;
      console.log('GameStore: Listeners registered.');
    },

    /**
     * Crée la connexion initiale au serveur et enregistre les écouteurs globaux.
     * Cette action est conçue pour être appelée une seule fois au démarrage de l'application.
     */
    initializeStore() {
      if (socketState.isConnected || this.listenersRegistered) {
        console.log('Store already initialized.');
        return;
      }
      console.log('Initializing GameStore: Connecting and registering listeners...');
      this.registerGameListeners();
      socketService.connect();
    },

    /**
     * Emet l'événement pour rejoindre une partie spécifique.
     * Gère le cas où la connexion n'est pas encore établie en attendant l'événement 'connect'.
     * @param {string} roomName Le nom de la partie à rejoindre.
     * @param {string} playerName Le nom du joueur.
     * @param {boolean} isSpectator Indique si l'utilisateur rejoint en tant que spectateur.
     */
    connectAndJoin(roomName, playerName, isSpectator = false) {
      const joinPayload = { roomName, playerName, isSpectator };

      if (socketState.isConnected) {
        console.log('GameStore: Already connected, emitting joinGame.');
        socketService.emit('joinGame', joinPayload);
      } else {
        console.log('GameStore: Not connected. Queuing joinGame until connect event.');
        socketService.once('connect', () => {
          console.log('GameStore: Connect event received, now emitting joinGame.');
          socketService.emit('joinGame', joinPayload);
        });
      }
    },

    /**
     * Envoie une action du joueur au serveur via le service.
     * @param {string} action L'action à envoyer (ex: 'moveLeft').
     */
    sendPlayerAction(action) {
      if (!socketState.isConnected) {
        console.warn("Impossible d'envoyer l'action : non connecté.");
        return;
      }
      socketService.emit('playerAction', action);
    },

    /**
     * Informe le serveur que l'hôte souhaite démarrer la partie via le service.
     */
    sendStartGame() {
      if (!socketState.isConnected) {
        console.warn("Impossible de démarrer la partie : non connecté.");
        return;
      }
      socketService.emit('startGame');
    },

    /**
     * Informs the server that the host wants to restart the game.
     */
    sendRestartGame() {
      if (!socketState.isConnected) {
        console.warn("Cannot restart game: not connected.");
        return;
      }
      socketService.emit('restartGame');
    },

    /**
     * Informe le serveur que le joueur quitte la partie et nettoie l'état local.
     * La connexion socket reste active.
     */
    leaveGame() {
      if (socketState.isConnected) {
        socketService.emit('leaveGame');
      }
      this.gameState = null; // Nettoyage immédiat de l'état côté client
    },

    /**
     * Informe le serveur que le client entre dans le navigateur de lobbies.
     * Gère le cas où la connexion n'est pas encore établie en attendant l'événement 'connect'.
     */
    enterLobbyBrowser() {
      if (socketState.isConnected) {
        console.log('GameStore: Already connected, emitting enterLobbyBrowser.');
        socketService.emit('enterLobbyBrowser');
      } else {
        console.log('GameStore: Not connected. Queuing enterLobbyBrowser until connect event.');
        socketService.once('connect', () => {
          console.log('GameStore: Connect event received, now emitting enterLobbyBrowser.');
          socketService.emit('enterLobbyBrowser');
        });
      }
    },

    /**
     * Informe le serveur que le client quitte le navigateur de lobbies.
     */
    leaveLobbyBrowser() {
      socketService.emit('leaveLobbyBrowser');
    },

    /**
     * Demande au serveur d'envoyer les données du leaderboard.
     */
    fetchLeaderboard() {
      if (socketState.isConnected) {
        socketService.emit('getLeaderboard');
      } else {
        socketService.once('connect', () => {
          socketService.emit('getLeaderboard');
        });
      }
    },
  },
});
