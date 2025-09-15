import { describe, it, expect, beforeEach, vi } from 'vitest';
import Game from './Game.js';
import Player from './Player.js';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../shared/constants.js';

describe('Game Model', () => {

  describe('Player Management', () => {
    let game;
    const hostInfo = { id: 'host123', name: 'HostPlayer' };

    beforeEach(() => {
      game = new Game(hostInfo, 'multiplayer');
    });

    it('should add a new player', () => {
      game.addPlayer({ id: 'p2', name: 'Player2' });
      expect(game.players.length).toBe(2);
      expect(game.players[1].name).toBe('Player2');
    });

    it('should remove a player', () => {
      game.addPlayer({ id: 'p2', name: 'Player2' });
      game.removePlayer('p2');
      expect(game.players.length).toBe(1);
    });

    it('should migrate host when host leaves', () => {
      game.addPlayer({ id: 'p2', name: 'Player2' });
      game.removePlayer('host123');
      expect(game.players[0].isHost).toBe(true);
      expect(game.players[0].name).toBe('Player2');
    });
  });

  describe('Game Logic and Collision', () => {
    let game;
    let player1;

    beforeEach(() => {
      const hostInfo = { id: 'p1', name: 'Player1' };
      game = new Game(hostInfo, 'solo');
      game.startGame(); // Start the game to assign the first piece
      player1 = game.players[0];
    });

    it('should not allow a piece to move beyond the left wall', () => {
      player1.activePiece.position = { x: 0, y: 5 };
      game.handlePlayerAction('p1', 'moveLeft');
      expect(player1.activePiece.position.x).toBe(0);
    });

    it('should not allow a piece to move beyond the right wall', () => {
      // Assuming a 2-width piece like 'O'
      player1.activePiece.shape = [[1,1],[1,1]];
      player1.activePiece.position = { x: BOARD_WIDTH - 2, y: 5 };
      game.handlePlayerAction('p1', 'moveRight');
      expect(player1.activePiece.position.x).toBe(BOARD_WIDTH - 2);
    });

    it('should not allow a piece to move into another piece', () => {
      // Place a block for the piece to collide with
      player1.board[10][6] = 1; // A block is at (x:6, y:10)

      // Position a 2x1 piece to the left of the block
      player1.activePiece.shape = [[1, 1]];
      player1.activePiece.position = { x: 4, y: 10 };

      // Attempt to move right, which would cause the right part of the piece
      // to overlap with the block at (x:6, y:10)
      game.handlePlayerAction('p1', 'moveRight');

      // The piece's X position should not have changed
      expect(player1.activePiece.position.x).toBe(4);
    });
  });

  describe('Tick and Game Flow', () => {
    let game;
    let player1;

    beforeEach(() => {
      const hostInfo = { id: 'p1', name: 'Player1' };
      game = new Game(hostInfo, 'solo');
      game.startGame();
      player1 = game.players[0];
      // Mock Date.now() to control time
      vi.spyOn(Date, 'now').mockReturnValue(0);
    });

    it('should move the active piece down by one on a game tick', () => {
      player1.activePiece.position = { x: 5, y: 5 };

      // Simulate time passing
      Date.now.mockReturnValue(2000);
      game.tick();

      expect(player1.activePiece.position.y).toBe(6);
    });

    it('should lock the piece when it hits the bottom', () => {
      player1.activePiece.position = { x: 5, y: BOARD_HEIGHT - 1 };
      player1.activePiece.shape = [[1]]; // 1x1 piece for simplicity

      Date.now.mockReturnValue(2000);
      game.tick();

      // The piece should be locked, and a new piece should be active
      expect(player1.board[BOARD_HEIGHT - 1][5]).not.toBe(0);
      expect(player1.activePiece).not.toBeNull();
      // Verify that the old piece is no longer the active one
      expect(player1.activePiece.position.y).not.toBe(BOARD_HEIGHT);
    });

    it('should clear a completed line and add score', () => {
      // Manually create a board with one line almost full
      const almostFullRow = Array(BOARD_WIDTH).fill(1);
      almostFullRow[5] = 0; // Leave one gap
      player1.board[BOARD_HEIGHT - 1] = almostFullRow;

      // Position a 1x1 piece directly in the gap on the last row, ready to be locked
      player1.activePiece.shape = [[1]];
      player1.activePiece.type = 'I'; // Ensure a valid type for locking
      player1.activePiece.position = { x: 5, y: BOARD_HEIGHT - 1 };

      const initialScore = player1.score;

      // Let the piece fall and lock
      Date.now.mockReturnValue(2000);
      game.tick();

      // Assertions
      // The line should now be empty
      expect(player1.board[BOARD_HEIGHT - 1].every(cell => cell === 0)).toBe(true);
      // Score should have increased by SINGLE line score
      expect(player1.score).toBe(initialScore + 40); // Assuming SCORES.SINGLE is 40
    });
  });
});
