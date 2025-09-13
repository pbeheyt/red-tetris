// Ce fichier contient les constantes de jeu partagées entre le client et le serveur.
// Il garantit que la logique de jeu et l'affichage sont basés sur les mêmes règles.

export const BOARD_WIDTH = 10; // Nombre de colonnes
export const BOARD_HEIGHT = 20; // Nombre de lignes

export const GAME_TICK_MS = 100; // Vitesse de la boucle de jeu en millisecondes

// Représentation d'une cellule vide
export const CELL_EMPTY = 0;

// Identifiants de Tetriminos partagés (client/serveur)
export const TETROMINO_IDS = {
  I: 1,
  O: 2,
  T: 3,
  S: 4,
  Z: 5,
  J: 6,
  L: 7,
};

export const ID_TO_TETROMINO = {
  1: 'I',
  2: 'O',
  3: 'T',
  4: 'S',
  5: 'Z',
  6: 'J',
  7: 'L',
};

// Couleurs par type (inspiré des conventions Tetris)
export const TETROMINO_COLORS = {
  I: '#00FFFF', // Cyan
  O: '#FFFF00', // Yellow
  T: '#800080', // Purple
  S: '#00FF00', // Green
  Z: '#FF0000', // Red
  J: '#0000FF', // Blue
  L: '#FFA500', // Orange
};

// Taille minimale d'un carré (pour le rendu responsive)
export const MIN_TILE_PX = 12;
export const MAX_TILE_PX = 32;
