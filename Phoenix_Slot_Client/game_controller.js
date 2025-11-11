document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('slot-canvas');
    const spinButton = document.getElementById('spin-button');
    const balanceAmountSpan = document.getElementById('balance-amount');
    const buyFreeSpinsButton = document.getElementById('buy-freespins-button');
    const buyRespinButton = document.getElementById('buy-respin-button');
    const betSelect = document.getElementById('bet-select');
    const anteBetCheckbox = document.getElementById('ante-bet-checkbox');

    if (!canvas || !spinButton || !balanceAmountSpan || !buyFreeSpinsButton || !buyRespinButton || !betSelect || !anteBetCheckbox) {
        console.error('Essential DOM elements are missing!');
        return;
    }

    const renderer = new SlotRenderer(canvas);
    let balance = 100.00;
    let isSpinning = false;

    // --- Placeholder Reel Strips ---
    // In a real game, these would be much longer and defined in a separate config file.
    const reelSymbols = ['SA', 'SB', 'SC', 'SD', 'LA', 'LK', 'LQ', 'LJ', 'L10', 'W2', 'ST', 'CH'];
    const reelStrips = Array.from({ length: 5 }, () => {
        // Simple shuffle for variety in this simulation
        return reelSymbols.sort(() => Math.random() - 0.5);
    });
    const reelStripLength = reelStrips[0].length;
    // --- End Reel Strips ---

    /**
     * Calculates the total current bet based on the selected base bet and Ante Bet.
     */
    function getCurrentTotalBet() {
        let baseBet = parseFloat(betSelect.value);
        if (anteBetCheckbox.checked) {
            return baseBet * 1.30;
        }
        return baseBet;
    }

    /**
     * Generates the final 3x5 grid from the server's reel stop indices.
     * @param {number[]} indices - The array of 5 stop indices from the server.
     * @returns {Array<Array<string>>} The 2D array representing the final grid.
     */
    function generateFinalGrid(indices) {
        const finalGrid = [[], [], []]; // 3 rows
        indices.forEach((stopIndex, reel) => {
            const reelStrip = reelStrips[reel];
            const stripLen = reelStrip.length;
            // Top symbol (index above the stop index)
            finalGrid[0][reel] = reelStrip[(stopIndex - 1 + stripLen) % stripLen];
            // Middle symbol (the stop index)
            finalGrid[1][reel] = reelStrip[stopIndex];
            // Bottom symbol (index below the stop index)
            finalGrid[2][reel] = reelStrip[(stopIndex + 1) % stripLen];
        });
        return finalGrid;
    }

    function initializeGame() {
        balanceAmountSpan.textContent = balance.toFixed(2);
        renderer.drawInitialGrid();
    }

    function simulateServerResponse() {
        return new Promise(resolve => {
            const initial_reel_indices = Array.from({ length: 5 }, () => Math.floor(Math.random() * reelStripLength));

            // --- Simulate a win that includes a WILD ---
            let total_win_amount = 0;
            let winning_positions = [];
            // 50% chance to simulate a win for demonstration
            if (Math.random() < 0.5) {
                total_win_amount = 25.00;
                // For this simulation, let's say the win is on the middle row and includes a WILD
                winning_positions = [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }];
                // Force a WILD to be in one of these positions
                const wildReel = Math.floor(Math.random() * 3); // 0, 1, or 2
                const wildIndex = reelStrips[wildReel].indexOf('W2');
                if (wildIndex !== -1) {
                    initial_reel_indices[wildReel] = wildIndex;
                }
            }
            // --- End Simulation ---

            const response = {
                initial_reel_indices: initial_reel_indices,
                total_win_amount: total_win_amount,
                winning_positions: winning_positions
            };
            setTimeout(() => resolve(response), 200);
        });
    }

    async function handleSpin() {
        if (isSpinning) return;
        const totalBet = getCurrentTotalBet();
        if (balance < totalBet) {
            alert('Insufficient funds to spin.');
            return;
        }

        isSpinning = true;
        setControlsDisabled(true);

        balance -= totalBet;
        balanceAmountSpan.textContent = balance.toFixed(2);

        const spinResult = await simulateServerResponse();
        const finalGrid = generateFinalGrid(spinResult.initial_reel_indices);

        await renderer.animateReelsStop(finalGrid);

        // ** FEATURE IMPLEMENTATION: Highlight winning WILDs after animation **
        if (spinResult.winning_positions && spinResult.winning_positions.length > 0) {
            renderer.drawGrid(finalGrid, spinResult.winning_positions);
        }

        setTimeout(() => {
            balance += spinResult.total_win_amount;
            balanceAmountSpan.textContent = balance.toFixed(2);
            isSpinning = false;
            setControlsDisabled(false);
        }, 2100);
    }

    async function handleBuyFreeSpins() {
        if (isSpinning) return;
        const baseBet = parseFloat(betSelect.value);
        const cost = 100 * baseBet;
        if (balance < cost) {
            alert('Insufficient funds for Buy Feature.');
            return;
        }

        isSpinning = true;
        setControlsDisabled(true);

        balance -= cost;
        balanceAmountSpan.textContent = balance.toFixed(2);

        console.log('Free Spins Purchased!');
        await renderer.animateFeatureTrigger("Free Spins");

        // ** CORE FIX: Execute the Free Spins loop **
        await renderer.runFreeSpinsBonus();

        // Re-enable controls after the bonus is finished.
        isSpinning = false;
        setControlsDisabled(false);
    }

    async function handleBuyMoneyRespin() {
        if (isSpinning) return;
        const baseBet = parseFloat(betSelect.value);
        const cost = 80 * baseBet;
        if (balance < cost) {
            alert('Insufficient funds for Buy Feature.');
            return;
        }

        isSpinning = true;
        setControlsDisabled(true);

        balance -= cost;
        balanceAmountSpan.textContent = balance.toFixed(2);

        console.log('Money Respin Purchased!');
        await renderer.animateFeatureTrigger("Money Respin");

        renderer.runMoneyRespinBonus();
        // For this simulation, we leave controls disabled to show the bonus is "active".
    }

    function setControlsDisabled(state) {
        spinButton.disabled = state;
        buyFreeSpinsButton.disabled = state;
        buyRespinButton.disabled = state;
        betSelect.disabled = state;
        anteBetCheckbox.disabled = state;
    }

    // Attach event listeners
    spinButton.addEventListener('click', handleSpin);
    buyFreeSpinsButton.addEventListener('click', handleBuyFreeSpins);
    buyRespinButton.addEventListener('click', handleBuyMoneyRespin);
    betSelect.addEventListener('change', () => console.log(`Bet changed to: ${getCurrentTotalBet().toFixed(2)}`));
    anteBetCheckbox.addEventListener('change', () => console.log(`Ante Bet toggled. New total bet: ${getCurrentTotalBet().toFixed(2)}`));

    initializeGame();
});
