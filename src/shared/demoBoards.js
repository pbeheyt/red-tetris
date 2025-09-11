// Demo board and piece for client-side rendering tests
// Uses string tetromino keys ('I','O','T','S','Z','J','L') so GameBoard can color them

import { BOARD_WIDTH, BOARD_HEIGHT } from './constants.js';

function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array.from({ length: BOARD_WIDTH }, () => 0));
}

export const DEMO_BOARD = (() => {
  const b = createEmptyBoard();

  // Build a small stack at the bottom with various shapes/colors
  // Bottom row
  b[19] = ['J','J','J','J','S','S','Z','Z','L','L'];
  // Row 18 with a gap
  b[18] = ['J',0, 'T','T','T',0, 'Z',0, 'L',0];
  // Row 17 scattered
  b[17][0] = 'I';
  b[17][1] = 'I';
  b[17][5] = 'O';
  b[17][6] = 'O';
  b[17][9] = 'S';
  // A small column on the left
  b[16][0] = 'I';
  b[15][0] = 'I';

  // Add a T perched on small platform
  b[16][3] = 'T';
  b[16][4] = 'T';
  b[16][5] = 'T';
  b[15][4] = 'T';

  // Add an O block 2x2 at top-right area
  b[14][7] = 'O';
  b[14][8] = 'O';
  b[13][7] = 'O';
  b[13][8] = 'O';

  // Add S and Z interlocking mid-field
  // S shape
  b[13][1] = 'S';
  b[13][2] = 'S';
  b[12][2] = 'S';
  b[12][3] = 'S';
  // Z shape
  b[12][4] = 'Z';
  b[12][5] = 'Z';
  b[11][5] = 'Z';
  b[11][6] = 'Z';

  // Extend right side with a J pillar
  b[12][9] = 'J';
  b[11][9] = 'J';

  // Near-full row with a single gap
  b[10] = ['I','I','T','T',0,'S','S','Z','Z','J'];

  return b;
})();

export const DEMO_ACTIVE_PIECE = {
  kind: 'T',
  // Orientation: T up
  shape: [
    [1,1,1],
    [0,1,0],
  ],
  position: { x: 3, y: 2 },
};


