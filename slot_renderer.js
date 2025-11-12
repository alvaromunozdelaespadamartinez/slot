/**
 * slot_renderer.js
 *
 * Handles all rendering logic for the slot machine on the HTML5 canvas.
 * It is responsible for drawing the grid, symbols, and managing visual effects,
 * but does not contain any game logic.
 */

// Use an IIFE (Immediately Invoked Function Expression) to create a private scope
const SlotRenderer = (() => {

    // --- Canvas Setup ---
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

    // --- Symbol Color Mapping (for placeholder visuals) ---
    const SYMBOL_COLORS = {
        'H1': '#FF4500', // Phoenix
        'H2': '#FF8C00', // Gold Coin
        'M1': '#DAA520', // Scroll
        'M2': '#BDB76B', // Vase
        'L1': '#8A2BE2', // Ace
        'L2': '#A52A2A', // King
        'L3': '#5F9EA0', // Queen
        'W2': '#FFD700', // WILD x2 (Gold)
        'SC': '#32CD32', // SCATTER (Green)
        'CASH': '#C0C0C0', // Money Symbol (Silver)
        'EMPTY': '#1a1a1a'  // Empty space for tumbles
    };

    // --- Core Drawing Functions ---

    /**
     * Clears the entire canvas area.
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
        const color = SYMBOL_COLORS[symbol] || '#FFFFFF'; // Default to white for unknown symbols

        // Draw symbol background with a small margin
        ctx.fillStyle = color;
        ctx.fillRect(x + 5, y + 5, SYMBOL_WIDTH - 10, SYMBOL_HEIGHT - 10);
        ctx.strokeStyle = '#111';
        ctx.strokeRect(x + 5, y + 5, SYMBOL_WIDTH - 10, SYMBOL_HEIGHT - 10);

        // Draw symbol text identifier
        ctx.fillStyle = '#000';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const text = (symbol === 'W2') ? 'WILD x2' : symbol;
        ctx.fillText(text, x + SYMBOL_WIDTH / 2, y + SYMBOL_HEIGHT / 2);
    };

    /**
     * Renders the entire 5x3 grid based on the provided 2D array of symbols.
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
     * Visually highlights winning symbols on the grid.
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
     * In a real implementation, this would show blurred, spinning reels.
     * For recovery, it instantly draws the final grid.
     * @param {Array<Array<string>>} finalGrid - The grid to display upon spin completion.
     * @returns {Promise<void>} A promise that resolves when the animation is complete.
     */
    const animateSpin = (finalGrid) => {
        console.log("RENDERER: Executing spin animation.");
        // For now, we instantly draw the final grid.
        drawGrid(finalGrid);
        // Return a resolved promise to allow the game controller to proceed.
        return Promise.resolve();
    };

    /**
     * Placeholder for animating the Tumble/Cascade sequence.
     * It shows the grid with empty spaces, then draws the final grid after a delay.
     * @param {Array<Array<string>>} gridWithEmpty - Grid after winning symbols are removed.
     * @param {Array<Array<string>>} finalGrid - Grid after new symbols have fallen.
     * @returns {Promise<void>} A promise that resolves when the tumble animation is complete.
     */
    const animateTumble = (gridWithEmpty, finalGrid) => {
        console.log("RENDERER: Executing tumble animation.");
        // Step 1: Draw the grid with the winning symbols removed.
        drawGrid(gridWithEmpty);

        // Step 2: Wait briefly, then draw the final grid with new symbols.
        return new Promise(resolve => {
            setTimeout(() => {
                drawGrid(finalGrid);
                resolve();
            }, 500); // 0.5s delay to simulate symbols falling.
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
