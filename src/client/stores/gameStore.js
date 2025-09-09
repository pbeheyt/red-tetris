import { defineStore } from 'pinia';
import { io } from 'socket.io-client';

// En développement, le proxy Vite redirigera cette requête vers le port 3004.
// En production, le client et le serveur seront sur le même domaine.
const socket = io({
  // Désactive la connexion automatique pour la contrôler manuellement
  autoConnect: false,
});

export const useGameStore = defineStore('game', {
  /**
   * Le State contient la "photographie" complète de l'état du jeu.
   * @returns {{
   *   gameState: Object | null,
   *   isConnected: boolean,
   *   socketId: string | null
   * }}
   */
  state: () => ({
    // L'objet GameState reçu du serveur, conforme au Contrat n°2
    gameState: null,
    // L'état de la connexion socket
    isConnected: false,
    // L'ID du socket du client, utile pour identifier le joueur
    socketId: null,
  }),

  /**
   * Les Getters permettent d'accéder à des parties calculées ou spécifiques de l'état.
   */
  getters: {
    // Renvoie l'état du joueur actuel en se basant sur le socketId
    currentPlayer: (state) => {
      if (!state.gameState || !state.socketId) return null;
      return state.gameState.players.find(p => p.id === state.socketId);
    },
    // Renvoie le plateau de jeu du joueur actuel
    board: (state) => state.currentPlayer?.board || [],
    // Renvoie la pièce active du joueur actuel
    activePiece: (state) => state.currentPlayer?.activePiece || null,
  },

  /**
   * Les Actions sont les fonctions qui modifient l'état.
   */
  actions: {
    /**
     * Établit la connexion socket et met en place les écouteurs d'événements.
     * @param {string} roomName Le nom de la partie à rejoindre.
     * @param {string} playerName Le nom du joueur.
     */
    initializeSocket(roomName, playerName) {
      // Évite les connexions multiples si la fonction est appelée plusieurs fois
      if (this.isConnected) return;

      socket.connect();

      socket.on('connect', () => {
        console.log(`Connecté au serveur avec l'ID : ${socket.id}`);
        this.isConnected = true;
        this.socketId = socket.id;
        // Une fois connecté, on rejoint la partie
        this.joinGame(roomName, playerName);
      });

      socket.on('disconnect', () => {
        console.log('Déconnecté du serveur.');
        this.isConnected = false;
        this.socketId = null;
        this.gameState = null; // Réinitialise l'état du jeu à la déconnexion
      });

      // Écouteur principal pour les mises à jour de l'état du jeu
      socket.on('gameStateUpdate', (newState) => {
        this.setGameState(newState);
      });
    },

    /**
     * Met à jour l'état du jeu local avec les données du serveur.
     * @param {Object} newState Le nouvel objet GameState.
     */
    setGameState(newState) {
      console.log('Received gameStateUpdate:', newState);
      this.gameState = newState;
    },

    /**
     * Informe le serveur que le client souhaite rejoindre une partie.
     * @param {string} roomName
     * @param {string} playerName
     */
    joinGame(roomName, playerName) {
      socket.emit('joinGame', { roomName, playerName });
    },

    /**
     * Envoie une action du joueur au serveur.
     * @param {string} action L'action à envoyer (ex: 'moveLeft').
     */
    sendPlayerAction(action) {
      if (!this.isConnected) {
        console.warn("Impossible d'envoyer l'action : non connecté.");
        return;
      }
      socket.emit('playerAction', action);
    },

    /**
     * Nettoie la connexion socket.
     */
    disconnectSocket() {
      if (socket) {
        socket.disconnect();
      }
    },
  },
});
