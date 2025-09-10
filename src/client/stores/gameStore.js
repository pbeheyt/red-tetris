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
  },

  /**
   * Les Actions sont les fonctions qui modifient l'état.
   */
  actions: {
    /**
     * S'abonne aux événements du jeu via le socketService.
     * Cette méthode est conçue pour être appelée une seule fois.
     */
    registerGameListeners() {
      // Met en place les écouteurs pour les événements spécifiques au jeu.
      socketService.on('gameStateUpdate', (newState) => {
        this.gameState = newState;
      });

      // Écouteur pour la mise à jour de la liste des lobbies
      socketService.on('lobbiesListUpdate', (lobbiesList) => {
        this.lobbies = lobbiesList;
      });

      // On peut aussi réagir à la déconnexion pour nettoyer l'état du jeu.
      socketService.on('disconnect', () => {
        this.gameState = null;
      });
    },

    /**
     * Déclenche la connexion et rejoint une partie.
     * @param {string} roomName Le nom de la partie à rejoindre.
     * @param {string} playerName Le nom du joueur.
     */
    connectAndJoin(roomName, playerName) {
      // S'assure que les écouteurs sont en place.
      this.registerGameListeners();
      
      // Demande au service de se connecter.
      socketService.connect();

      // Une fois la connexion établie, rejoint la partie.
      socketService.on('connect', () => {
        socketService.emit('joinGame', { roomName, playerName });
      });
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
     * Demande au service de se déconnecter.
     */
    disconnectFromGame() {
      socketService.disconnect();
    },

    /**
     * Informe le serveur que le client entre dans le navigateur de lobbies.
     */
    enterLobbyBrowser() {
      socketService.emit('enterLobbyBrowser');
    },

    /**
     * Informe le serveur que le client quitte le navigateur de lobbies.
     */
    leaveLobbyBrowser() {
      socketService.emit('leaveLobbyBrowser');
    },
  },
});
