import Player from './Player.js';
import Piece from './Piece.js';

/**
 * @typedef {Object} GameState
 * @property {('playing'|'finished')} status - L'état actuel de la partie.
 * @property {string|null} winner - Le nom du gagnant si la partie est terminée.
 * @property {Array<PlayerState>} players - La liste des états de chaque joueur.
 */

/**
 * @typedef {Object} PlayerState
 * @property {string} id - L'identifiant du joueur.
 * @property {string} name - Le nom du joueur.
 * @property {boolean} hasLost - Si le joueur a perdu.
 * @property {Array<Array<number>>} board - La grille de jeu du joueur.
 * @property {Object} activePiece - La pièce active du joueur.
 * @property {string} activePiece.shape - La forme de la pièce.
 * @property {string} activePiece.color - La couleur de la pièce.
 * @property {Object} activePiece.position - La position (x, y) de la pièce.
 * @property {Array<Object>} nextPieces - La liste des 2-3 prochaines pièces.
 */


/**
 * La classe Game ("Machine à Tetris") gère toute la logique d'une partie.
 * Elle est agnostique de la manière dont les données sont transmises (Socket.io, etc.).
 * @param {Object} hostInfo - Objet contenant les infos du premier joueur ({ id, name }).
 * @param {Array<string>} pieceSequence - La séquence de pièces prédéfinie pour la partie.
 * @constructor
 */
function Game(hostInfo, pieceSequence) {
  this.players = [new Player(hostInfo.id, hostInfo.name, true)];
  this.pieceSequence = pieceSequence;
  this.status = 'lobby'; // 'lobby' | 'playing' | 'finished'
  this.winner = null;
}

/**
 * Fait avancer le jeu d'une unité de temps (un "tick").
 * @returns {GameState} La "photographie" complète et à jour de l'état du jeu.
 */
Game.prototype.tick = function() {
  console.log('Game tick');
  // La logique de descente des pièces, de complétion des lignes, etc., sera implémentée ici.
  
  // Pour l'instant, on retourne un état factice.
  return this.getCurrentGameState();
};

/**
 * Gère une action effectuée par un joueur.
 * @param {string} playerId - L'ID du joueur qui effectue l'action.
 * @param {('moveLeft'|'moveRight'|'rotate'|'softDrop'|'hardDrop')} action - L'action effectuée.
 * @returns {GameState} La "photographie" complète et à jour de l'état du jeu.
 */
Game.prototype.handlePlayerAction = function(playerId, action) {
  console.log(`Handling action '${action}' for player ${playerId}`);
  // La logique de mouvement/rotation des pièces sera implémentée ici.
  
  // Pour l'instant, on retourne un état factice.
  return this.getCurrentGameState();
};

/**
 * Génère la "photographie" actuelle du jeu.
 * @returns {GameState}
 */
Game.prototype.getCurrentGameState = function() {
  // Cette méthode construira l'objet GameState à partir de l'état interne de l'instance Game.
  // C'est le Contrat n°2.
  return {
    status: this.status,
    winner: this.winner,
    players: this.players.map(player => ({
      id: player.id,
      name: player.name,
      isHost: player.isHost,
      hasLost: player.hasLost,
      board: player.board,
      activePiece: player.activePiece,
      nextPieces: [],
    })),
  };
};

/**
 * Ajoute un nouveau joueur à la partie.
 * @param {Object} playerInfo - Informations sur le joueur ({ id, name }).
 * @returns {boolean} - True si le joueur a été ajouté, false sinon.
 */
Game.prototype.addPlayer = function(playerInfo) {
  if (this.status !== 'lobby') {
    console.log(`Game is already playing. Cannot add player ${playerInfo.name}.`);
    return false;
  }
  const newPlayer = new Player(playerInfo.id, playerInfo.name, false);
  this.players.push(newPlayer);
  console.log(`Player ${playerInfo.name} added to the game. Total players: ${this.players.length}`);
  return true;
};

/**
 * Supprime un joueur de la partie.
 * @param {string} playerId - L'ID du joueur à supprimer.
 * @returns {number} Le nombre de joueurs restants.
 */
Game.prototype.removePlayer = function(playerId) {
  this.players = this.players.filter(p => p.id !== playerId);
  console.log(`Player ${playerId} removed. Total players: ${this.players.length}`);

  // Si la partie était en cours et qu'il ne reste qu'un joueur, ce joueur gagne.
  // La boucle de jeu continue pour lui permettre de jouer pour le score.
  if (this.status === 'playing' && this.players.length === 1) {
    this.status = 'finished';
    this.winner = this.players[0].name;
    console.log(`Game in finished state. Winner is ${this.winner}.`);
  }

  return this.players.length;
};

/**
 * Démarre la partie, changeant son statut de 'lobby' à 'playing'.
 */
Game.prototype.startGame = function() {
  if (this.status === 'lobby') {
    this.status = 'playing';
    console.log('Game has started!');
  }
};

export default Game;
