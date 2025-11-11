document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('slot-canvas');
    const spinButton = document.getElementById('spin-button');
    const balanceAmountSpan = document.getElementById('balance-amount');
    const totalWinAmountSpan = document.getElementById('total-win-amount'); // New element
    const buyFreeSpinsButton = document.getElementById('buy-freespins-button');
    const buyRespinButton = document.getElementById('buy-respin-button');
    const betSelect = document.getElementById('bet-select');
    const anteBetCheckbox = document.getElementById('ante-bet-checkbox');

    if (!canvas || !spinButton || !balanceAmountSpan || !totalWinAmountSpan || !buyFreeSpinsButton || !buyRespinButton || !betSelect || !anteBetCheckbox) {
        console.error('Essential DOM elements are missing!');
        return;
    }

    const renderer = new SlotRenderer(canvas);
    let balance = 100.00;
    let isSpinning = false;

    // --- Placeholder Reel Strips ---
    const reelSymbols = ['SA', 'SB', 'SC', 'SD', 'LA', 'LK', 'LQ', 'LJ', 'L10', 'W2', 'ST', 'CH'];
    const reelStrips = Array.from({ length: 5 }, () => reelSymbols.sort(() => Math.random() - 0.5));
    const reelStripLength = reelStrips[0].length;
    // --- End Reel Strips ---

    function getCurrentTotalBet() {
        let baseBet = parseFloat(betSelect.value);
        if (anteBetCheckbox.checked) {
            return baseBet * 1.30;
        }
        return baseBet;
    }

    function generateFinalGrid(indices) {
        const finalGrid = [[], [], []];
        indices.forEach((stopIndex, reel) => {
            const reelStrip = reelStrips[reel];
            const stripLen = reelStrip.length;
            finalGrid[0][reel] = reelStrip[(stopIndex - 1 + stripLen) % stripLen];
            finalGrid[1][reel] = reelStrip[stopIndex];
            finalGrid[2][reel] = reelStrip[(stopIndex + 1) % stripLen];
        });
        return finalGrid;
    }

    /**
     * Animates the total win display, counting up from a start value to an end value.
     * @param {number} finalAmount - The final win amount to display.
     * @param {number} duration - The duration of the animation in milliseconds.
     */
    function animateWinCounter(finalAmount, duration = 1500) {
        let startAmount = parseFloat(totalWinAmountSpan.textContent);
        let range = finalAmount - startAmount;
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const increment = range * (progress / duration);

            let currentAmount = startAmount + increment;
            if (progress >= duration) {
                currentAmount = finalAmount; // Ensure it ends on the exact amount
            }

            totalWinAmountSpan.textContent = currentAmount.toFixed(2);

            if (progress < duration) {
                requestAnimationFrame(step);
            }
        }
        requestAnimationFrame(step);
    }

    function initializeGame() {
        balanceAmountSpan.textContent = balance.toFixed(2);
        renderer.drawInitialGrid();
        setControlsDisabled(false); // Ensure spin button is enabled and glowing
    }

    function simulateServerResponse() {
        return new Promise(resolve => {
            const initial_reel_indices = Array.from({ length: 5 }, () => Math.floor(Math.random() * reelStripLength));

            let total_win_for_spin = 0;
            let winning_positions = [];
            if (Math.random() < 0.7) { // Increased win chance for demo
                total_win_for_spin = (Math.random() * 5 + 1) * getCurrentTotalBet();
                winning_positions = [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }];
                const wildReel = Math.floor(Math.random() * 3);
                const wildIndex = reelStrips[wildReel].indexOf('W2');
                if (wildIndex !== -1) initial_reel_indices[wildReel] = wildIndex;
            }

            const response = {
                initial_reel_indices: initial_reel_indices,
                total_win_for_spin: total_win_for_spin,
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
        totalWinAmountSpan.textContent = "0.00"; // Reset win counter at the start of a paid spin

        balance -= totalBet;
        balanceAmountSpan.textContent = balance.toFixed(2);

        const spinResult = await simulateServerResponse();
        const finalGrid = generateFinalGrid(spinResult.initial_reel_indices);

        await renderer.animateReelsStop(finalGrid);

        if (spinResult.winning_positions && spinResult.winning_positions.length > 0) {
            renderer.drawGrid(finalGrid, spinResult.winning_positions);
        }

        // Handle win amount update and animation
        if (spinResult.total_win_for_spin > 0) {
            balance += spinResult.total_win_for_spin;
            animateWinCounter(spinResult.total_win_for_spin);
            // Delay re-enabling controls until win animation is likely over
            setTimeout(() => {
                balanceAmountSpan.textContent = balance.toFixed(2);
                isSpinning = false;
                setControlsDisabled(false);
            }, 1600);
        } else {
            // No win, re-enable controls sooner
            isSpinning = false;
            setControlsDisabled(false);
        }
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
        // In a real game, server would provide bonus outcome. Here we simulate it.
        const bonusWin = baseBet * (Math.random() * 150 + 50); // Simulate a win between 50x and 200x

        await renderer.runFreeSpinsBonus(); // Placeholder for bonus animation

        balance += bonusWin;
        balanceAmountSpan.textContent = balance.toFixed(2);
        animateWinCounter(bonusWin, 2500); // Longer animation for feature win

        setTimeout(() => {
            isSpinning = false;
            setControlsDisabled(false);
        }, 2600);
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
    // Placeholder for respin buy
    buyRespinButton.addEventListener('click', () => alert('Money Respin feature not implemented in this version.'));

    initializeGame();
});
