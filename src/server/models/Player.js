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
  this.board = []; // La grille de jeu du joueur sera initialisée ici.
  this.activePiece = null; // La pièce actuellement contrôlée par le joueur.
  this.hasLost = false;
}

export default Player;
