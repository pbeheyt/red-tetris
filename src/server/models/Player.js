import { BOARD_WIDTH, BOARD_HEIGHT } from '../../shared/constants.js';

/**
 * Crée une grille de jeu vide.
 * @returns {Array<Array<number>>} Une matrice remplie de 0.
 */
function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

/**
 * Représente un joueur dans la partie.
 * @param {string} id - L'identifiant unique du joueur (par exemple, l'ID du socket).
 * @param {string} name - Le nom du joueur.
 * @param {boolean} isHost - Indique si le joueur est l'hôte de la partie.
 * @constructor
 */
function Player(id, name, isHost = false) {
  this.id = id;
  this.name = name;
  this.isHost = isHost;
  this.board = createEmptyBoard(); // Le plateau est maintenant initialisé.
  this.activePiece = null; // La pièce actuellement contrôlée par le joueur.
  this.hasLost = false;
}

export default Player;
