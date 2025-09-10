import Player from './Player.js';
import Piece from './Piece.js';

/**
 * @typedef {Object} GameState
 * @property {('lobby'|'playing'|'finished')} status - L'état actuel de la partie.
 * @property {string|null} winner - Le nom du gagnant si la partie est terminée.
 * @property {Array<PlayerState>} players - La liste des états de chaque joueur.
 * @property {Array<{id: string, name: string}>} spectators - La liste des spectateurs.
 */

/**
 * @typedef {Object} PlayerState
 * @property {string} id - L'identifiant du joueur.
 * @property {string} name - Le nom du joueur.
 * @property {boolean} hasLost - Si le joueur a perdu.
 * @property {number} score - Le score actuel du joueur.
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
  this.spectators = [];
  this.pieceSequence = pieceSequence;
  this.status = 'lobby'; // 'lobby' | 'playing' | 'finished'
  this.winner = null;
}

/**
 * Fait avancer le jeu d'une unité de temps (un "tick").
 * @returns {GameState} La "photographie" complète et à jour de l'état du jeu.
 */
Game.prototype.tick = function() {
  // La boucle de jeu ne doit agir que si la partie est en cours.
  if (this.status === 'playing') {
    // console.log('Game tick');
    // La future logique de descente des pièces, de complétion des lignes, etc., ira ici.
  }
  
  // On retourne toujours l'état actuel, même si la partie est finie,
  // pour que tous les clients reçoivent l'état final.
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
      score: player.score,
      board: player.board,
      activePiece: player.activePiece,
      nextPieces: [],
    })),
    spectators: this.spectators,
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
 * Ajoute un nouveau spectateur à la partie.
 * @param {Object} spectatorInfo - Informations sur le spectateur ({ id, name }).
 * @returns {boolean} - Toujours true.
 */
Game.prototype.addSpectator = function(spectatorInfo) {
  if (!this.spectators.some(s => s.id === spectatorInfo.id)) {
    this.spectators.push({ id: spectatorInfo.id, name: spectatorInfo.name });
    console.log(`Spectator ${spectatorInfo.name} added. Total spectators: ${this.spectators.length}`);
  }
  return true;
};

/**
 * Supprime un joueur de la partie et gère la migration de l'hôte si nécessaire.
 * @param {string} playerId - L'ID du joueur à supprimer.
 * @returns {number} Le nombre de joueurs restants.
 */
Game.prototype.removePlayer = function(playerId) {
  const playerToRemove = this.players.find(p => p.id === playerId);
  if (!playerToRemove) return this.players.length;

  const wasHost = playerToRemove.isHost;

  this.players = this.players.filter(p => p.id !== playerId);
  console.log(`Player ${playerId} removed. Total players: ${this.players.length}`);

  // Si l'hôte est parti et qu'il reste des joueurs, le plus ancien devient le nouvel hôte.
  if (wasHost && this.players.length > 0) {
    this.players[0].isHost = true;
    console.log(`Host migrated to player ${this.players[0].name} (${this.players[0].id}).`);
  }

  // Si la partie était en cours et qu'il ne reste qu'un joueur, ce joueur gagne.
  if (this.status === 'playing' && this.players.length === 1) {
    this.status = 'finished';
    this.winner = this.players[0].name;
    console.log(`Game in finished state. Winner is ${this.winner}.`);
  }

  return this.players.length;
};

/**
 * Supprime un spectateur de la partie.
 * @param {string} spectatorId - L'ID du spectateur à supprimer.
 */
Game.prototype.removeSpectator = function(spectatorId) {
  this.spectators = this.spectators.filter(s => s.id !== spectatorId);
  console.log(`Spectator ${spectatorId} removed. Total spectators: ${this.spectators.length}`);
};

/**
 * Démarre la partie, changeant son statut de 'lobby' à 'playing'.
 */
Game.prototype.startGame = function() {
  if (this.status === 'lobby') {
    this.status = 'playing';
    console.log('Game has started!');

    // Logique de score factice : l'hôte gagne 500 points après 3 secondes.
    setTimeout(() => {
      // Vérifie si la partie est toujours en cours avant de la terminer.
      if (this.status === 'playing') {
        const host = this.players.find(p => p.isHost);
        if (host) {
          console.log(`Timer finished. Awarding 500 points to host ${host.name}.`);
          host.score = 500;
          this.winner = host.name;
        }
        this.status = 'finished';
        console.log('Game status set to finished by timer.');
      }
    }, 3000);
  }
};

export default Game;
