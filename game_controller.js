/**
 * game_controller.js
 *
 * This script acts as the "brain" of the slot machine application. It manages the game state,
 * handles all UI interactions (button clicks, selections), and simulates communication with a
 * game server. It orchestrates the game flow and commands the SlotRenderer to update the visuals.
 */

// Use an IIFE (Immediately Invoked Function Expression) to create a private scope.
const GameController = (() => {

    // --- DOM Element References ---
    const spinButton = document.getElementById('spin-button');
    const betSelector = document.getElementById('bet-selector');
    const anteBetToggle = document.getElementById('ante-bet-toggle');
    const balanceDisplay = document.getElementById('balance-display');
    const totalBetDisplay = document.getElementById('total-bet-display');
    const totalWinDisplay = document.querySelector('#total-win-display p');
    const buyFreeSpinsButton = document.getElementById('buy-free-spins');
    const buyMoneyRespinButton = document.getElementById('buy-money-respin');

    // --- Game State Management ---
    let gameState = {
        balance: 1000.00,
        baseBet: 1.00,
        totalBet: 1.00,
        isAnteBetActive: false,
        isSpinning: false,
    };

    // --- Game Configuration (for simulation purposes) ---
    const SYMBOLS = ['H1', 'H2', 'M1', 'M2', 'L1', 'L2', 'L3', 'W2', 'SC', 'CASH'];
    const REELS = 5;
    const ROWS = 3;

    // --- Core Game Logic ---

    /**
     * Simulates a response from a game server.
     * This function is crucial for fixing the "always same screen" bug by generating
     * a new, random outcome on every call. It also constructs a simulated Tumble sequence.
     * @returns {Promise<Object>} A promise that resolves with the simulated server response.
     */
    const simulateServerResponse = () => {
        return new Promise(resolve => {
            // Simulate network latency
            setTimeout(() => {
                // Step 1: Generate a completely new, random initial grid.
                let grid = Array(ROWS).fill(null).map(() =>
                    Array(REELS).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
                );

                // Step 2: Simulate a plausible win and a multi-step Tumble sequence.
                const totalWin = gameState.totalBet * (Math.floor(Math.random() * 6) + 1);
                const tumbleSequence = [];

                // Tumble 1: Initial win
                const winningPositions1 = [{row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}];
                tumbleSequence.push({
                    grid: JSON.parse(JSON.stringify(grid)), // Deep copy of the grid at this step
                    winningPositions: winningPositions1,
                    winAmount: totalWin * 0.5
                });

                // Tumble 2: Create a new grid state after the first win
                let gridAfterTumble1 = JSON.parse(JSON.stringify(grid));
                winningPositions1.forEach(p => { gridAfterTumble1[p.row][p.col] = 'EMPTY'; }); // Remove winning symbols

                // Fill empty spaces with new random symbols
                for(let r = 0; r < ROWS; r++) {
                    for(let c = 0; c < REELS; c++) {
                        if(gridAfterTumble1[r][c] === 'EMPTY') {
                            gridAfterTumble1[r][c] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                        }
                    }
                }
                const winningPositions2 = [{row: 0, col: 2}, {row: 1, col: 2}, {row: 2, col: 2}];
                tumbleSequence.push({
                    grid: gridAfterTumble1,
                    winningPositions: winningPositions2,
                    winAmount: totalWin * 0.5
                });

                resolve({
                    initialGrid: tumbleSequence[0].grid,
                    totalWinForSpin: totalWin,
                    tumbleSequence: tumbleSequence
                });

            }, 500); // 0.5s delay
        });
    };

    /**
     * Handles the entire spin process, from initiation to completion.
     */
    const handleSpin = async () => {
        if (gameState.isSpinning || gameState.balance < gameState.totalBet) return;

        // 1. Set the game to a "spinning" state
        gameState.isSpinning = true;
        toggleControls(false);
        updateBalance(-gameState.totalBet);
        updateWinDisplay(0);

        // 2. Request a result from the simulated server
        const response = await simulateServerResponse();

        // 3. Animate the initial reel spin and landing
        await SlotRenderer.animateSpin(response.initialGrid);

        // 4. Process the Tumble sequence step-by-step
        let accumulatedWin = 0;
        for (const step of response.tumbleSequence) {
            accumulatedWin += step.winAmount;
            updateWinDisplay(accumulatedWin);
            SlotRenderer.highlightWins(step.winningPositions);

            // Create a temporary grid with empty spaces to pass to the renderer
            let gridWithEmpty = JSON.parse(JSON.stringify(step.grid));
            step.winningPositions.forEach(p => { gridWithEmpty[p.row][p.col] = 'EMPTY'; });

            await new Promise(r => setTimeout(r, 400)); // Pause to show highlighted wins
            await SlotRenderer.animateTumble(gridWithEmpty, step.grid);
            await new Promise(r => setTimeout(r, 400)); // Pause after tumble animation
        }

        // 5. Finalize the spin and update the balance with the total win
        updateBalance(response.totalWinForSpin);
        gameState.isSpinning = false;
        toggleControls(true);
    };

    // --- UI Update & Event Handler Functions ---

    /**
     * Updates the total bet display based on the selected base bet and Ante toggle.
     */
    const updateTotalBet = () => {
        gameState.baseBet = parseFloat(betSelector.value);
        gameState.isAnteBetActive = anteBetToggle.checked;

        let finalBet = gameState.baseBet;
        if (gameState.isAnteBetActive) {
            finalBet *= 1.30; // Apply 30% Ante Bet cost
        }
        gameState.totalBet = finalBet;

        totalBetDisplay.textContent = `$${gameState.totalBet.toFixed(2)}`;
        // Update feature buy costs dynamically
        buyFreeSpinsButton.querySelector('small').textContent = `COST: $${(gameState.baseBet * 100).toFixed(2)}`;
        buyMoneyRespinButton.querySelector('small').textContent = `COST: $${(gameState.baseBet * 80).toFixed(2)}`;
    };

    /**
     * Updates the player's balance display.
     * @param {number} amount - The amount to add (can be negative to subtract).
     */
    const updateBalance = (amount) => {
        gameState.balance += amount;
        balanceDisplay.textContent = `$${gameState.balance.toFixed(2)}`;
    };

    /**
     * Updates the total win display.
     * @param {number} amount - The new total win amount to display.
     */
    const updateWinDisplay = (amount) => {
        totalWinDisplay.textContent = `$${amount.toFixed(2)}`;
    };

    /**
     * Enables or disables UI controls to prevent actions while spinning.
     * @param {boolean} isEnabled - True to enable controls, false to disable.
     */
    const toggleControls = (isEnabled) => {
        spinButton.disabled = !isEnabled;
        betSelector.disabled = !isEnabled;
        anteBetToggle.disabled = !isEnabled;
        buyFreeSpinsButton.disabled = !isEnabled;
        buyMoneyRespinButton.disabled = !isEnabled;
    };

    /**
     * Handles the "Buy Free Spins" button click.
     */
    const handleBuyFreeSpins = () => {
        if (gameState.isSpinning) return;
        const cost = gameState.baseBet * 100;
        if (gameState.balance >= cost) {
            console.log("FEATURE TRIGGER: Buying Free Spins for $" + cost);
            updateBalance(-cost);
            // In a real implementation, this would trigger a special spin.
            // For now, it just launches a regular spin.
            handleSpin();
        } else {
            console.warn("Not enough balance to buy Free Spins.");
        }
    };

    /**
     * Initializes the game controller on page load.
     */
    const init = () => {
        // Set the initial UI state based on default gameState
        updateTotalBet();
        updateBalance(0);

        // Attach event listeners to all interactive UI elements
        spinButton.addEventListener('click', handleSpin);
        betSelector.addEventListener('change', updateTotalBet);
        anteBetToggle.addEventListener('change', updateTotalBet);
        buyFreeSpinsButton.addEventListener('click', handleBuyFreeSpins);
        buyMoneyRespinButton.addEventListener('click', () => console.log("Money Respin feature is not yet implemented."));

        // Perform the initial render of an empty grid
        const initialGrid = Array(ROWS).fill(null).map(() => Array(REELS).fill('EMPTY'));
        SlotRenderer.drawGrid(initialGrid);

        console.log("Game Controller Initialized. Phoenix Slot V1 Recovery is ready.");
    };

    // --- Public API ---
    // Expose the init function to be called from outside the IIFE.
    return {
        init
    };
})();

// --- Entry Point ---
// Wait for the DOM to be fully loaded before initializing the game.
document.addEventListener('DOMContentLoaded', GameController.init);
