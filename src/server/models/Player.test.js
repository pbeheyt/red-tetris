import { describe, it, expect } from 'vitest';
import Player from './Player.js';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../../shared/constants.js';

describe('Player Model', () => {

  it('should correctly initialize a standard player', () => {
    const playerId = 'socket123';
    const playerName = 'JohnDoe';
    const player = new Player(playerId, playerName);

    // Check basic properties
    expect(player.id).toBe(playerId);
    expect(player.name).toBe(playerName);
    expect(player.isHost).toBe(false); // Default should be false
    expect(player.hasLost).toBe(false);
    expect(player.activePiece).toBeNull();

    // Check board initialization
    expect(player.board).toBeDefined();
    expect(player.board.length).toBe(BOARD_HEIGHT);
    expect(player.board[0].length).toBe(BOARD_WIDTH);

    // Ensure the board is filled with zeros
    const isBoardEmpty = player.board.every(row => row.every(cell => cell === 0));
    expect(isBoardEmpty).toBe(true);
  });

  it('should correctly initialize a host player', () => {
    const hostId = 'socket456';
    const hostName = 'JaneHost';
    const hostPlayer = new Player(hostId, hostName, true);

    // Check basic properties
    expect(hostPlayer.id).toBe(hostId);
    expect(hostPlayer.name).toBe(hostName);
    expect(hostPlayer.isHost).toBe(true); // Should be true as passed in constructor
    expect(hostPlayer.hasLost).toBe(false);
  });

});
