/**
 * game_controller.js
 *
 * Manages the main game loop, UI interactions, and state. It simulates
 * communication with a server and commands the SlotRenderer to update the visuals.
 * This is the "brain" of the client-side application.
 */

// Use an IIFE to create a private scope
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

    // --- Game State ---
    let gameState = {
        balance: 1000.00,
        baseBet: 1.00,
        totalBet: 1.00,
        isAnteBetActive: false,
        isSpinning: false,
    };

    // --- Game Configuration (for simulation) ---
    const SYMBOLS = ['H1', 'H2', 'M1', 'M2', 'L1', 'L2', 'L3', 'W2', 'SC', 'CASH'];
    const REELS = 5;
    const ROWS = 3;

    // --- Core Game Logic ---

    /**
     * Simulates a response from a game server.
     * This is the core of the recovery, ensuring a UNIQUE, random outcome on every call.
     * It also simulates a multi-step tumble sequence.
     * @returns {Promise<Object>} A promise that resolves with the simulated server response.
     */
    const simulateServerResponse = () => {
        return new Promise(resolve => {
            // Simulate network delay
            setTimeout(() => {
                // Step 1: Generate a new, random initial grid. THIS FIXES THE "SAME SCREEN" BUG.
                let grid = [];
                for (let r = 0; r < ROWS; r++) {
                    grid[r] = [];
                    for (let c = 0; c < REELS; c++) {
                        grid[r][c] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                    }
                }

                // Step 2: Simulate a win and a tumble sequence (for demonstration).
                // In a real game, this logic would be much more complex.
                const totalWin = gameState.totalBet * (Math.floor(Math.random() * 5) + 1); // Random win multiplier
                const tumbleSequence = [];

                // Create a simple 2-step tumble for demonstration
                // 1. Initial win
                const winningPositions1 = [{row: 1, col: 1}, {row: 1, col: 2}, {row: 1, col: 3}];
                tumbleSequence.push({
                    grid: JSON.parse(JSON.stringify(grid)), // Deep copy
                    winningPositions: winningPositions1,
                    winAmount: totalWin * 0.5
                });

                // 2. Grid after removing winning symbols
                let gridAfterTumble1 = JSON.parse(JSON.stringify(grid));
                winningPositions1.forEach(p => { gridAfterTumble1[p.row][p.col] = 'EMPTY'; });

                // 3. Grid after new symbols fall
                let finalGrid = gridAfterTumble1;
                for(let r = 0; r < ROWS; r++) {
                    for(let c = 0; c < REELS; c++) {
                        if(finalGrid[r][c] === 'EMPTY') {
                            finalGrid[r][c] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                        }
                    }
                }
                const winningPositions2 = [{row: 0, col: 2}, {row: 1, col: 2}, {row: 2, col: 2}];
                tumbleSequence.push({
                    grid: finalGrid,
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
     * Handles the entire spin process from start to finish.
     */
    const handleSpin = async () => {
        if (gameState.isSpinning || gameState.balance < gameState.totalBet) return;

        // 1. Setup spin state
        gameState.isSpinning = true;
        toggleControls(false);
        updateBalance(-gameState.totalBet);
        updateWinDisplay(0, true); // Reset win display

        // 2. Get result from the "server"
        const response = await simulateServerResponse();

        // 3. Animate the initial spin landing
        await SlotRenderer.animateSpin(response.initialGrid);

        // 4. Process the tumble sequence
        let accumulatedWin = 0;
        for (const step of response.tumbleSequence) {
            accumulatedWin += step.winAmount;
            updateWinDisplay(accumulatedWin);
            SlotRenderer.highlightWins(step.winningPositions);

            // Create the grid with empty spaces for the renderer
            let gridWithEmpty = JSON.parse(JSON.stringify(step.grid));
            step.winningPositions.forEach(p => { gridWithEmpty[p.row][p.col] = 'EMPTY'; });

            await new Promise(r => setTimeout(r, 300)); // Pause to show highlighted wins
            await SlotRenderer.animateTumble(gridWithEmpty, step.grid);
            await new Promise(r => setTimeout(r, 300)); // Pause after tumble
        }

        // 5. Finalize spin
        updateBalance(response.totalWinForSpin);
        gameState.isSpinning = false;
        toggleControls(true);
    };

    // --- UI Update & Event Handler Functions ---

    /**
     * Updates the total bet based on base bet and Ante toggle.
     */
    const updateTotalBet = () => {
        gameState.baseBet = parseFloat(betSelector.value);
        gameState.isAnteBetActive = anteBetToggle.checked;
        let finalBet = gameState.baseBet;
        if (gameState.isAnteBetActive) {
            finalBet *= 1.30; // Apply 30% Ante cost
        }
        gameState.totalBet = finalBet;
        totalBetDisplay.textContent = `$${gameState.totalBet.toFixed(2)}`;
        // Update feature buy costs as well
        buyFreeSpinsButton.querySelector('small').textContent = `COST: $${(gameState.baseBet * 100).toFixed(2)}`;
        buyMoneyRespinButton.querySelector('small').textContent = `COST: $${(gameState.baseBet * 80).toFixed(2)}`;
    };

    /**
     * Updates the player's balance.
     * @param {number} amount - The amount to add (can be negative).
     */
    const updateBalance = (amount) => {
        gameState.balance += amount;
        balanceDisplay.textContent = `$${gameState.balance.toFixed(2)}`;
    };

    /**
     * Updates the total win display.
     * @param {number} amount - The new total win amount.
     * @param {boolean} [reset=false] - If true, sets the amount directly.
     */
    const updateWinDisplay = (amount, reset = false) => {
        // In a future step, this can be animated to count up.
        totalWinDisplay.textContent = `$${amount.toFixed(2)}`;
    };

    /**
     * Enables or disables UI controls during spin.
     * @param {boolean} isEnabled - True to enable, false to disable.
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
        if(gameState.isSpinning) return;
        const cost = gameState.baseBet * 100;
        if(gameState.balance >= cost) {
            console.log("FEATURE TRIGGER: Buying Free Spins!");
            updateBalance(-cost);
            // In a real implementation, this would trigger a special spin sequence.
            // For now, just run a normal spin.
            handleSpin();
        } else {
            console.log("Not enough balance to buy Free Spins.");
        }
    };


    /**
     * Initializes the game controller.
     */
    const init = () => {
        // Setup initial UI state
        updateTotalBet();
        updateBalance(0);

        // Attach event listeners
        spinButton.addEventListener('click', handleSpin);
        betSelector.addEventListener('change', updateTotalBet);
        anteBetToggle.addEventListener('change', updateTotalBet);
        buyFreeSpinsButton.addEventListener('click', handleBuyFreeSpins);
        buyMoneyRespinButton.addEventListener('click', () => console.log("Money Respin feature not implemented yet."));

        // Initial render of an empty grid
        SlotRenderer.drawGrid(
            Array(ROWS).fill(null).map(() => Array(REELS).fill('EMPTY'))
        );

        console.log("Game Controller Initialized. Phoenix Slot V1 Recovery is ready.");
    };

    // --- Public API ---
    return {
        init
    };
})();

// --- Entry Point ---
// Wait for the DOM to be fully loaded before initializing the game.
document.addEventListener('DOMContentLoaded', GameController.init);
