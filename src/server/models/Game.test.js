import { describe, it, expect, beforeEach } from 'vitest';
import Game from './Game.js';

describe('Game Model', () => {
  const hostInfo = { id: 'host123', name: 'HostPlayer' };
  const pieceSequence = []; // Not used in these tests
  let game;

  // 'beforeEach' s'exécute avant chaque test ('it'), garantissant un état propre.
  beforeEach(() => {
    game = new Game(hostInfo, pieceSequence);
  });

  describe('constructor', () => {
    it('should initialize a game with a single host player', () => {
      expect(game.players).toBeDefined();
      expect(game.players.length).toBe(1);
      expect(game.status).toBe('lobby');

      const host = game.players[0];
      expect(host.id).toBe(hostInfo.id);
      expect(host.name).toBe(hostInfo.name);
      expect(host.isHost).toBe(true);
    });
  });

  describe('startGame', () => {
    it("should change the game status from 'lobby' to 'playing'", () => {
      expect(game.status).toBe('lobby');
      game.startGame();
      expect(game.status).toBe('playing');
    });
  });

  describe('addPlayer', () => {
    it('should add a new player to the game when in lobby', () => {
      const newPlayerInfo = { id: 'player456', name: 'NewPlayer' };
      const result = game.addPlayer(newPlayerInfo);

      expect(result).toBe(true);
      expect(game.players.length).toBe(2);
      const newPlayer = game.players.find(p => p.id === newPlayerInfo.id);
      expect(newPlayer).toBeDefined();
      expect(newPlayer.name).toBe(newPlayerInfo.name);
      expect(newPlayer.isHost).toBe(false);
    });

    it('should not add a player if the game has already started', () => {
      game.startGame(); // La partie passe en statut 'playing'
      const newPlayerInfo = { id: 'player789', name: 'LateComer' };
      const result = game.addPlayer(newPlayerInfo);

      expect(result).toBe(false);
      expect(game.players.length).toBe(1);
    });
  });

  describe('removePlayer', () => {
    const player2Info = { id: 'player456', name: 'Player2' };
    const player3Info = { id: 'player789', name: 'Player3' };

    beforeEach(() => {
      game.addPlayer(player2Info);
      game.addPlayer(player3Info);
    });

    it('should remove a player and return the number of players left', () => {
      expect(game.players.length).toBe(3);

      const playersLeft = game.removePlayer(player2Info.id);
      expect(playersLeft).toBe(2);
      expect(game.players.length).toBe(2);
      expect(game.players.find(p => p.id === player2Info.id)).toBeUndefined();
    });

    it('should migrate host correctly when the current host leaves', () => {
      expect(game.players[0].isHost).toBe(true); // Host initial
      expect(game.players[1].isHost).toBe(false);

      game.removePlayer(hostInfo.id); // L'hôte part

      expect(game.players.length).toBe(2);
      expect(game.players[0].id).toBe(player2Info.id); // Le joueur 2 est maintenant le premier
      expect(game.players[0].isHost).toBe(true); // Le joueur 2 doit être le nouvel hôte
    });

    it('should end the game and declare a winner if only one player remains', () => {
      const singlePlayerGame = new Game({ id: 'p1', name: 'Player1' }, []);
      singlePlayerGame.addPlayer({ id: 'p2', name: 'Player2' });
      
      singlePlayerGame.startGame(); // La partie doit être en cours
      expect(singlePlayerGame.status).toBe('playing');
      
      singlePlayerGame.removePlayer('p1');

      expect(singlePlayerGame.players.length).toBe(1);
      expect(singlePlayerGame.status).toBe('finished');
      expect(singlePlayerGame.winner).toBe('Player2');
    });
  });
});
