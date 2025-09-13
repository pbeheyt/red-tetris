import Player from './Player.js';
import Piece from './Piece.js';
import { addScore } from '../services/databaseService.js';
import {
  TETROMINO_IDS,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PIECE_FALL_RATE_MS
} from '../../shared/constants.js';

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
 */
class Game {
  /**
   * @param {Object} hostInfo - Objet contenant les infos du premier joueur ({ id, name }).
   */
  constructor(hostInfo) {
    this.players = [new Player(hostInfo.id, hostInfo.name, true)];
    this.spectators = [];
    this.masterPieceSequence = [];
    this._generateNewBag();
    this.status = 'lobby'; // 'lobby' | 'playing' | 'finished'
    this.winner = null;
  }

  /**
   * Generates a new "bag" of 7 unique tetrominoes and adds it to the master sequence.
   */
  _generateNewBag() {
    const pieceTypes = Object.keys(TETROMINO_IDS);

    // Fisher-Yates shuffle algorithm
    for (let i = pieceTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pieceTypes[i], pieceTypes[j]] = [pieceTypes[j], pieceTypes[i]];
    }

    this.masterPieceSequence.push(...pieceTypes);
  }

  /**
   * Gets the next piece type for a specific player from the master sequence.
   * @param {Player} player - The player for whom to get the next piece.
   * @returns {string} The type of the next piece (e.g., 'T', 'L').
   */
  _getPieceTypeForPlayer(player) {
    // If the player is about to need a piece that doesn't exist yet, generate a new bag.
    if (player.pieceIndex >= this.masterPieceSequence.length) {
      this._generateNewBag();
      console.log('Master piece sequence extended. New length:', this.masterPieceSequence.length);
    }

    const pieceType = this.masterPieceSequence[player.pieceIndex];
    player.pieceIndex++; // Crucially, advance the index for this player
    return pieceType;
  }

  /**
   * Checks if a piece's position and shape are valid on a given board.
   * @param {Player} player - The player whose board we are checking against.
   * @param {Piece} piece - The piece object to validate.
   * @returns {boolean} - True if the position is valid, false otherwise.
   */
  _isValidPosition(player, piece) {
    const { shape, position } = piece;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        // If it's an empty part of the piece's shape, skip it
        if (shape[y][x] === 0) {
          continue;
        }

        const boardX = position.x + x;
        const boardY = position.y + y;

        // 1. Check if it's outside the board's horizontal bounds
        if (boardX < 0 || boardX >= BOARD_WIDTH) {
          return false;
        }
        // 2. Check if it's outside the board's vertical bounds (below the floor)
        if (boardY >= BOARD_HEIGHT) {
          return false;
        }
        // 3. Check if it's colliding with an existing piece on the board
        // (We only need to check if boardY is non-negative)
        if (boardY >= 0 && player.board[boardY][boardX] !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Rotates a piece's shape matrix clockwise.
   * @param {Array<Array<number>>} shape - The shape matrix to rotate.
   * @returns {Array<Array<number>>} The new, rotated shape matrix.
   */
  _rotateShape(shape) {
    const size = shape.length;
    const newShape = Array(size).fill(0).map(() => Array(size).fill(0));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // The formula for a 90-degree clockwise rotation is:
        // newX = size - 1 - y
        // newY = x
        newShape[x][size - 1 - y] = shape[y][x];
      }
    }
    return newShape;
  }

  /**
   * Locks a player's active piece onto their board.
   * @param {Player} player - The player whose piece is to be locked.
   */
  _lockPiece(player) {
    const { shape, position } = player.activePiece;
    const pieceId = TETROMINO_IDS[player.activePiece.type];

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const boardX = position.x + x;
          const boardY = position.y + y;
          // Ensure we don't try to lock parts of the piece that are off-screen
          if (boardY >= 0 && boardY < BOARD_HEIGHT) {
            player.board[boardY][boardX] = pieceId;
          }
        }
      }
    }
  }

  /**
   * Fait avancer le jeu d'une unité de temps (un "tick").
   * @returns {GameState} La "photographie" complète et à jour de l'état du jeu.
   */
  tick() {
    const now = Date.now();
    // La boucle de jeu ne doit agir que si la partie est en cours.
    if (this.status === 'playing') {
      this.players.forEach(player => {
        if (player.hasLost || !player.activePiece) {
          return; // Skip players who have lost or have no piece
        }

        // Check if it's time for the piece to fall
        const isTimeToFall = now - player.lastFallTime >= PIECE_FALL_RATE_MS;

        if (player.isSoftDropping || isTimeToFall) {
          if (isTimeToFall) {
            player.lastFallTime = now;
          }

          const piece = player.activePiece;
          const testPiece = new Piece(piece.type);
          testPiece.shape = piece.shape;
          testPiece.position = { ...piece.position };
          testPiece.position.y += 1; // Move down by one step

          if (this._isValidPosition(player, testPiece)) {
            // If the new position is valid, update the piece's position.
            player.activePiece.position.y += 1;
          } else {
            // If not valid, the piece has landed.
            this._lockPiece(player);

            // Get the next piece from the master sequence for the player
            const nextPieceType = this._getPieceTypeForPlayer(player);
            const newPiece = new Piece(nextPieceType);

            // Center the new piece horizontally
            newPiece.position.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2);

            // Assign the new piece to the player
            player.assignNewPiece(newPiece);

            // TODO: Check for game over condition here. If the new piece is not in a valid position, the game is over for this player.
          }
          // After a soft drop move, reset the flag. The client must send the action continuously.
          player.isSoftDropping = false;
        }
      });
    }

    // On retourne toujours l'état actuel, même si la partie est finie,
    // pour que tous les clients reçoivent l'état final.
    return this.getCurrentGameState();
  }

  /**
   * Gère une action effectuée par un joueur.
   * @param {string} playerId - L'ID du joueur qui effectue l'action.
   * @param {('moveLeft'|'moveRight'|'rotate'|'softDrop'|'hardDrop')} action - L'action effectuée.
   * @returns {GameState} La "photographie" complète et à jour de l'état du jeu.
   */
  handlePlayerAction(playerId, action) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.activePiece) {
      return this.getCurrentGameState();
    }

    const { activePiece } = player;
    const testPiece = new Piece(activePiece.type);
    testPiece.shape = activePiece.shape; // Keep current rotation
    testPiece.position = { ...activePiece.position };

    switch (action) {
      case 'moveLeft':
        testPiece.position.x -= 1;
        break;
      case 'moveRight':
        testPiece.position.x += 1;
        break;
      case 'rotate': {
        // The 'O' piece does not rotate.
        if (activePiece.type === 'O') {
          return this.getCurrentGameState();
        }

        const rotatedShape = this._rotateShape(activePiece.shape);

        // --- Wall Kick Logic ---
        // Test potential positions: 1. default, 2. kick left, 3. kick right ...
        const kickOffsets = [
          [0, 0],  // Default position
          [-1, 0], // Kick one unit to the left
          [1, 0],  // Kick one unit to the right
          [-2, 0], // Kick two units to the left
          [2, 0], // Kick two units to the right
        ];

        for (const [dx, dy] of kickOffsets) {
          const tempPiece = new Piece(activePiece.type);
          tempPiece.shape = rotatedShape;
          tempPiece.position = {
            x: activePiece.position.x + dx,
            y: activePiece.position.y + dy,
          };

          if (this._isValidPosition(player, tempPiece)) {
            // Found a valid position, apply rotation and kick
            player.activePiece.shape = tempPiece.shape;
            player.activePiece.position = tempPiece.position;
            return this.getCurrentGameState(); // Success, exit handler
          }
        }

        // If no valid position was found after all kick attempts, do nothing.
        return this.getCurrentGameState();
      }
      case 'softDrop':
        // The actual movement is handled in the tick, we just set the flag here.
        player.isSoftDropping = true;
        // We can return early as the tick will handle the movement.
        return this.getCurrentGameState();
      case 'hardDrop':
        // Find the lowest valid position by checking downwards
        while (this._isValidPosition(player, testPiece)) {
          testPiece.position.y++;
        }
        // Once the loop finds an invalid position, step back one
        testPiece.position.y--;

        // Directly update the player's piece position
        player.activePiece.position = testPiece.position;

        // Lock the piece and get a new one immediately
        this._lockPiece(player);
        const nextPieceType = this._getPieceTypeForPlayer(player);
        const newPiece = new Piece(nextPieceType);
        newPiece.position.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2);
        player.assignNewPiece(newPiece);

        // Since the state is immediately and drastically changed, we can return early
        // The regular validation path isn't needed for hard drop.
        return this.getCurrentGameState();
      // case 'rotate':
      //   // Rotation logic will go here
      //   break;
      // case 'softDrop':
      //   testPiece.position.y += 1;
      //   break;
    }

    if (this._isValidPosition(player, testPiece)) {
      // If the new position is valid, update the actual active piece
      player.activePiece.position = testPiece.position;
      player.activePiece.shape = testPiece.shape;
    }

    return this.getCurrentGameState();
  }

  /**
   * Génère la "photographie" actuelle du jeu.
   * @returns {GameState}
   */
  getCurrentGameState() {
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
  }

  /**
   * Ajoute un nouveau joueur à la partie.
   * @param {Object} playerInfo - Informations sur le joueur ({ id, name }).
   * @returns {boolean} - True si le joueur a été ajouté, false sinon.
   */
  addPlayer(playerInfo) {
    if (this.status !== 'lobby') {
      console.log(`Game is already playing. Cannot add player ${playerInfo.name}.`);
      return false;
    }
    const newPlayer = new Player(playerInfo.id, playerInfo.name, false);
    this.players.push(newPlayer);
    console.log(`Player ${playerInfo.name} added to the game. Total players: ${this.players.length}`);
    return true;
  }

  /**
   * Ajoute un nouveau spectateur à la partie.
   * @param {Object} spectatorInfo - Informations sur le spectateur ({ id, name }).
   * @returns {boolean} - Toujours true.
   */
  addSpectator(spectatorInfo) {
    if (!this.spectators.some(s => s.id === spectatorInfo.id)) {
      this.spectators.push({ id: spectatorInfo.id, name: spectatorInfo.name });
      console.log(`Spectator ${spectatorInfo.name} added. Total spectators: ${this.spectators.length}`);
    }
    return true;
  }

  /**
   * Supprime un joueur de la partie et gère la migration de l'hôte si nécessaire.
   * @param {string} playerId - L'ID du joueur à supprimer.
   * @returns {number} Le nombre de joueurs restants.
   */
  removePlayer(playerId) {
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
  }

  /**
   * Supprime un spectateur de la partie.
   * @param {string} spectatorId - L'ID du spectateur à supprimer.
   */
  removeSpectator(spectatorId) {
    this.spectators = this.spectators.filter(s => s.id !== spectatorId);
    console.log(`Spectator ${spectatorId} removed. Total spectators: ${this.spectators.length}`);
  }

  /**
   * Démarre la partie, changeant son statut de 'lobby' à 'playing'.
   */
  startGame() {
    if (this.status === 'lobby') {
      this.status = 'playing';
      console.log('Game has started!');

      // Assign the first piece to every player
      this.players.forEach(player => {
        const pieceType = this._getPieceTypeForPlayer(player);
        const newPiece = new Piece(pieceType);

        // Center the piece horizontally on the board
        newPiece.position.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(newPiece.shape[0].length / 2);

        player.assignNewPiece(newPiece);
      });

      // La logique de fin de partie et de sauvegarde des scores.
      // Pour l'instant, on simule une fin de partie après 5 secondes.
      // À l'avenir, la fin de partie sera déclenchée par la logique du jeu (ex: un seul joueur restant).
    //   setTimeout(() => {
    //     if (this.status !== 'playing') return;

    //     // Logique de score factice : chaque joueur obtient un score aléatoire.
    //     this.players.forEach(player => {
    //       player.score = Math.floor(Math.random() * 1000);
    //     });

    //     // Trouve le gagnant (celui avec le plus haut score)
    //     const winner = this.players.reduce((prev, current) => (prev.score > current.score) ? prev : current, {});
    //     this.winner = winner.name || 'Personne';

    //     this.status = 'finished';
    //     console.log(`Game finished. Winner: ${this.winner}. Saving scores...`);

    //     // Sauvegarde chaque score dans la base de données.
    //     this.players.forEach(player => {
    //       addScore({ name: player.name, score: player.score });
    //     });

    //   }, 5000);
    }
  }
}

export default Game;
