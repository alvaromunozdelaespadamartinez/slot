/**
 * slot_renderer.js
 *
 * This script is responsible for all the rendering logic on the HTML5 canvas.
 * It draws the game grid, symbols, and manages animations, but contains no game logic.
 * It acts as the visual layer, controlled by game_controller.js.
 */

// Use an IIFE (Immediately Invoked Function Expression) to create a private scope.
const SlotRenderer = (() => {

    // --- Canvas & Context Setup ---
    const canvas = document.getElementById('slot-canvas');
    if (!canvas) {
        console.error("Fatal Error: Canvas element with id 'slot-canvas' not found.");
        return;
    }
    const ctx = canvas.getContext('2d');

    // --- Grid & Symbol Configuration ---
    const REELS = 5;
    const ROWS = 3;
    const SYMBOL_WIDTH = canvas.width / REELS;
    const SYMBOL_HEIGHT = canvas.height / ROWS;
    const SYMBOL_MARGIN = 5;

    // --- Symbol Color Mapping (for placeholder visuals) ---
    // These colors are used to represent the different symbols on the grid.
    const SYMBOL_COLORS = {
        'H1': '#FF4500', // Phoenix (High-Pay)
        'H2': '#FF8C00', // Gold Coin (High-Pay)
        'M1': '#DAA520', // Scroll (Mid-Pay)
        'M2': '#BDB76B', // Vase (Mid-Pay)
        'L1': '#8A2BE2', // Ace (Low-Pay)
        'L2': '#A52A2A', // King (Low-Pay)
        'L3': '#5F9EA0', // Queen (Low-Pay)
        'W2': '#FFD700', // WILD x2 (Special)
        'SC': '#32CD32', // SCATTER (Special)
        'CASH': '#C0C0C0', // Money Symbol (Special)
        'EMPTY': '#1a1a1a'  // Empty space for tumbles
    };

    // --- Core Drawing Functions ---

    /**
     * Clears the entire canvas to prepare for the next frame.
     */
    const clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    /**
     * Draws a single symbol onto the canvas at a specified grid location.
     * @param {string} symbol - The key of the symbol to draw (e.g., 'H1', 'W2').
     * @param {number} col - The column (reel) index (0-4).
     * @param {number} row - The row index (0-2).
     */
    const drawSymbol = (symbol, col, row) => {
        const x = col * SYMBOL_WIDTH;
        const y = row * SYMBOL_HEIGHT;
        const color = SYMBOL_COLORS[symbol] || '#FFFFFF'; // Default to white if symbol is unknown

        // Draw the symbol's background rectangle with a margin
        ctx.fillStyle = color;
        ctx.fillRect(x + SYMBOL_MARGIN, y + SYMBOL_MARGIN, SYMBOL_WIDTH - (2 * SYMBOL_MARGIN), SYMBOL_HEIGHT - (2 * SYMBOL_MARGIN));

        // Add a border for better definition
        ctx.strokeStyle = '#111';
        ctx.strokeRect(x + SYMBOL_MARGIN, y + SYMBOL_MARGIN, SYMBOL_WIDTH - (2 * SYMBOL_MARGIN), SYMBOL_HEIGHT - (2 * SYMBOL_MARGIN));

        // Draw the text identifier for the symbol
        ctx.fillStyle = '#000';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const text = (symbol === 'W2') ? 'WILD x2' : symbol;
        ctx.fillText(text, x + SYMBOL_WIDTH / 2, y + SYMBOL_HEIGHT / 2);
    };

    /**
     * Renders the entire 5x3 grid based on the provided 2D array of symbols.
     * This is the main function for drawing a static game state.
     * @param {Array<Array<string>>} grid - A 3x5 array representing the game state.
     */
    const drawGrid = (grid) => {
        clearCanvas();
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < REELS; col++) {
                if (grid && grid[row] && grid[row][col]) {
                    drawSymbol(grid[row][col], col, row);
                }
            }
        }
    };

    // --- Animation & Effect Functions (Placeholders) ---

    /**
     * Visually highlights the winning symbols on the grid by drawing a border.
     * @param {Array<Object>} winningPositions - An array of {row, col} objects.
     */
    const highlightWins = (winningPositions) => {
        console.log("RENDERER: Highlighting winning symbols.", winningPositions);
        winningPositions.forEach(pos => {
            const x = pos.col * SYMBOL_WIDTH;
            const y = pos.row * SYMBOL_HEIGHT;
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 5;
            ctx.strokeRect(x + 2.5, y + 2.5, SYMBOL_WIDTH - 5, SYMBOL_HEIGHT - 5);
        });
    };

    /**
     * Placeholder for the main reel spin animation.
     * For recovery, this function instantly draws the final grid.
     * In a full implementation, this would show blurred, spinning reels.
     * @param {Array<Array<string>>} finalGrid - The grid to display upon spin completion.
     * @returns {Promise<void>} A promise that resolves when the animation is complete.
     */
    const animateSpin = (finalGrid) => {
        console.log("RENDERER: Executing spin animation.");
        drawGrid(finalGrid);
        return Promise.resolve(); // Instantly resolve for now
    };

    /**
     * Placeholder for animating the Tumble/Cascade sequence.
     * It shows the grid with empty spaces, then draws the final grid after a delay to simulate falling.
     * @param {Array<Array<string>>} gridWithEmpty - The grid after winning symbols are removed.
     * @param {Array<Array<string>>} finalGrid - The grid after new symbols have fallen into place.
     * @returns {Promise<void>} A promise that resolves when the tumble animation is complete.
     */
    const animateTumble = (gridWithEmpty, finalGrid) => {
        console.log("RENDERER: Executing tumble animation.");
        // Step 1: Draw the grid with the empty spaces.
        drawGrid(gridWithEmpty);

        // Step 2: Wait for a short duration, then draw the final grid.
        return new Promise(resolve => {
            setTimeout(() => {
                drawGrid(finalGrid);
                resolve();
            }, 500); // 0.5 second delay to simulate symbols falling.
        });
    };

    // --- Public API ---
    // Expose only the necessary functions to be called by the game_controller.
    return {
        drawGrid,
        animateSpin,
        animateTumble,
        highlightWins
    };

})();
