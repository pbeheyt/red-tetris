import { describe, it, expect } from 'vitest';
import Game from './Game.js';

describe('Game Model', () => {
  const hostInfo = { id: 'host123', name: 'HostPlayer' };
  const pieceSequence = []; // Not used in these tests

  it('should initialize a game with a single host player', () => {
    const game = new Game(hostInfo, pieceSequence);

    expect(game.players).toBeDefined();
    expect(game.players.length).toBe(1);
    expect(game.status).toBe('lobby');

    const host = game.players[0];
    expect(host.id).toBe(hostInfo.id);
    expect(host.name).toBe(hostInfo.name);
    expect(host.isHost).toBe(true);
  });

  it('should add a new player to the game', () => {
    const game = new Game(hostInfo, pieceSequence);
    const newPlayerInfo = { id: 'player456', name: 'NewPlayer' };

    game.addPlayer(newPlayerInfo);

    expect(game.players.length).toBe(2);
    const newPlayer = game.players.find(p => p.id === newPlayerInfo.id);
    expect(newPlayer).toBeDefined();
    expect(newPlayer.name).toBe(newPlayerInfo.name);
    expect(newPlayer.isHost).toBe(false);
  });

  it('should remove a player from the game and return the number of players left', () => {
    const game = new Game(hostInfo, pieceSequence);
    const player2Info = { id: 'player456', name: 'Player2' };
    const player3Info = { id: 'player789', name: 'Player3' };
    game.addPlayer(player2Info);
    game.addPlayer(player3Info);

    expect(game.players.length).toBe(3);

    // Remove one player
    const playersLeft = game.removePlayer(player2Info.id);
    expect(playersLeft).toBe(2);
    expect(game.players.length).toBe(2);
    expect(game.players.find(p => p.id === player2Info.id)).toBeUndefined();

    // Remove another player
    const finalPlayersLeft = game.removePlayer(hostInfo.id);
    expect(finalPlayersLeft).toBe(1);
    expect(game.players.length).toBe(1);
    expect(game.players.find(p => p.id === hostInfo.id)).toBeUndefined();
  });
});
