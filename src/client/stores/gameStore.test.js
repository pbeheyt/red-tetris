import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGameStore } from './gameStore.js';

// --- Mocking Dependencies ---
// Nous simulons le socketService pour isoler le store de la couche réseau.
// 'vi.mock' intercepte toutes les importations de ce module et les remplace
// par notre objet factice.
vi.mock('../services/socketService.js', () => ({
  socketService: {
    emit: vi.fn(), // 'vi.fn()' crée un "espion" qui nous permet de vérifier les appels.
    on: vi.fn(),
    once: vi.fn(),
    connect: vi.fn(),
  },
  // Nous devons aussi mocker l'état réactif exporté par le service.
  state: {
    isConnected: false,
    socketId: null,
  },
}));

// On importe le service mocké APRES la configuration du mock.
import { socketService, state as socketState } from '../services/socketService.js';

describe('Game Store', () => {

  // 'beforeEach' s'exécute avant chaque test ('it').
  beforeEach(() => {
    // 1. Crée une nouvelle instance de Pinia pour garantir l'isolation des tests.
    setActivePinia(createPinia());

    // 2. Réinitialise l'état du mock et l'historique des appels entre les tests.
    vi.clearAllMocks();
    socketState.isConnected = false;
    socketState.socketId = null;
  });

  describe('Getters', () => {
    it('`currentPlayer` should return the correct player object based on socketId', () => {
      // Arrange: Prépare l'état initial
      const store = useGameStore();
      const mockGameState = {
        status: 'playing',
        players: [
          { id: 'socket1', name: 'Player 1' },
          { id: 'socket2', name: 'Player 2' },
        ],
      };
      socketState.socketId = 'socket2'; // Simule que notre client est le Joueur 2
      store.gameState = mockGameState; // Définit l'état du jeu manuellement

      // Act & Assert: Exécute la logique et vérifie le résultat
      expect(store.currentPlayer).toBeDefined();
      expect(store.currentPlayer.name).toBe('Player 2');
    });

    it('`currentPlayer` should return null if gameState is not set', () => {
      // Arrange
      const store = useGameStore();
      socketState.socketId = 'socket1';
      store.gameState = null;

      // Act & Assert
      expect(store.currentPlayer).toBeNull();
    });

    it('`board` should return the board of the current player', () => {
        const store = useGameStore();
        const mockBoard = [[0, 0], [1, 1]];
        store.gameState = {
            players: [{ id: 'socket1', board: mockBoard }]
        };
        socketState.socketId = 'socket1';

        expect(store.board).toEqual(mockBoard);
    });

    it('`board` should return an empty array if there is no current player', () => {
        const store = useGameStore();
        store.gameState = { players: [] };
        socketState.socketId = 'socket1';

        expect(store.board).toEqual([]);
    });
  });

  describe('Actions', () => {
    it('`sendPlayerAction` should emit a "playerAction" event via socketService', () => {
      // Arrange
      const store = useGameStore();
      socketState.isConnected = true; // Simule une connexion active

      // Act
      store.sendPlayerAction('rotate');

      // Assert
      expect(socketService.emit).toHaveBeenCalledTimes(1);
      expect(socketService.emit).toHaveBeenCalledWith('playerAction', 'rotate');
    });

    it('`sendPlayerAction` should not emit if the socket is not connected', () => {
      // Arrange
      const store = useGameStore();
      socketState.isConnected = false; // Simule une connexion inactive

      // Act
      store.sendPlayerAction('moveLeft');

      // Assert
      expect(socketService.emit).not.toHaveBeenCalled();
    });

    it('`connectAndJoin` should emit "joinGame" if already connected', () => {
      // Arrange
      const store = useGameStore();
      socketState.isConnected = true;
      const roomName = 'testRoom';
      const playerName = 'Tester';

      // Act
      store.connectAndJoin(roomName, playerName);

      // Assert
      expect(socketService.emit).toHaveBeenCalledTimes(1);
      expect(socketService.emit).toHaveBeenCalledWith('joinGame', { roomName, playerName, isSpectator: false });
    });

    it('`connectAndJoin` should register a "once connect" listener if not connected', () => {
      // Arrange
      const store = useGameStore();
      socketState.isConnected = false;
      const roomName = 'testRoom';
      const playerName = 'Tester';

      // Act
      store.connectAndJoin(roomName, playerName);

      // Assert
      expect(socketService.emit).not.toHaveBeenCalled();
      expect(socketService.once).toHaveBeenCalledTimes(1);
      expect(socketService.once).toHaveBeenCalledWith('connect', expect.any(Function));
    });
  });
});
