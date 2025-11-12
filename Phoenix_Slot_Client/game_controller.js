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

    // --- Pay Tables & Paylines ---
    const paylines = [[1, 1, 1, 1, 1]]; // Middle row for simplicity
    const paytable = {
        'SA': { 3: 5, 4: 10, 5: 20 },
        'SB': { 3: 4, 4: 8, 5: 16 },
        'SC': { 3: 3, 4: 6, 5: 12 },
        'SD': { 3: 2, 4: 4, 5: 8 },
        'LA': { 3: 1, 4: 2, 5: 4 },
        'LK': { 3: 0.8, 4: 1.6, 5: 3.2 },
        'LQ': { 3: 0.6, 4: 1.2, 5: 2.4 },
        'LJ': { 3: 0.4, 4: 0.8, 5: 1.6 },
        'L10': { 3: 0.2, 4: 0.4, 5: 0.8 }
    };

    // --- Weighted Reel Strips for RTP Control ---
    const REEL_WEIGHTS = [
        // Reel 1
        ['L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'SC', 'SD', 'SA', 'SB', 'W2', 'ST', 'SC', 'SD', 'SA', 'SB'],
        // Reel 2
        ['L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'SC', 'SD', 'SA', 'SB', 'SC', 'SD', 'SA', 'SB', 'ST'],
        // Reel 3
        ['L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'SC', 'SD', 'SA', 'SB', 'W2', 'SC', 'SD', 'SA', 'SB', 'ST'],
        // Reel 4
        ['L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'SC', 'SD', 'SA', 'SB', 'SC', 'SD', 'SA', 'SB', 'ST'],
        // Reel 5
        ['L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'LK', 'LA', 'L10', 'LJ', 'LQ', 'SC', 'SD', 'SA', 'SB', 'W2', 'ST', 'SC', 'SD', 'SA', 'SB']
    ];
    // --- End Reel Strips ---

    function getCurrentTotalBet() {
        let baseBet = parseFloat(betSelect.value);
        if (anteBetCheckbox.checked) {
            return baseBet * 1.30;
        }
        return baseBet;
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
            const finalGrid = Array.from({ length: 3 }, () => Array(5).fill(null));
            for (let col = 0; col < 5; col++) {
                const reel = REEL_WEIGHTS[col];
                const stopIndex = Math.floor(Math.random() * reel.length);

                // This simulates a circular reel strip
                finalGrid[0][col] = reel[(stopIndex - 1 + reel.length) % reel.length];
                finalGrid[1][col] = reel[stopIndex];
                finalGrid[2][col] = reel[(stopIndex + 1) % reel.length];
            }

            const { totalWin, winningPositions } = checkPaylines(finalGrid);

            const response = {
                final_grid: finalGrid,
                total_win_for_spin: totalWin,
                winning_positions: winningPositions
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

        await renderer.animateReelsStop(spinResult.final_grid);

        if (spinResult.winning_positions && spinResult.winning_positions.length > 0) {
            renderer.drawGrid(spinResult.final_grid, spinResult.winning_positions);
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

    function setControlsDisabled(state) {
        spinButton.disabled = state;
        betSelect.disabled = state;
        anteBetCheckbox.disabled = state;
    }

    // Attach event listeners
    spinButton.addEventListener('click', handleSpin);
    buyFreeSpinsButton.addEventListener('click', () => console.log('Buy Free Spins feature is not implemented in this version.'));
    buyRespinButton.addEventListener('click', () => console.log('Money Respin feature is not implemented in this version.'));

    function checkPaylines(grid) {
        let totalWin = 0;
        const winningPositions = new Set();
        const reels = 5;

        paylines.forEach(line => {
            let lineSymbol = null;
            let count = 0;
            let potentialPositions = [];
            let wildInLine = false;

            for (let i = 0; i < reels; i++) {
                const row = line[i];
                const symbol = grid[row][i];

                if (symbol === 'W2') { // Wilds contribute to any line
                    wildInLine = true;
                    if(lineSymbol !== null) count++;
                    potentialPositions.push({ row, col: i });
                    continue;
                }

                if (lineSymbol === null) {
                    lineSymbol = symbol;
                    count = 1;
                    potentialPositions.push({ row, col: i });
                } else if (symbol === lineSymbol) {
                    count++;
                    potentialPositions.push({ row, col: i });
                } else {
                    break;
                }
            }

            if (paytable[lineSymbol] && paytable[lineSymbol][count]) {
                let baseWin = paytable[lineSymbol][count];
                const betAmount = parseFloat(betSelect.value); // Use the base bet for payline calculations
                let finalWin = baseWin * betAmount;
                if (wildInLine) {
                    finalWin *= 2;
                }
                totalWin += finalWin;
                potentialPositions.forEach(p => winningPositions.add(`${p.row},${p.col}`));
            }
        });

        const winningPositionsArray = Array.from(winningPositions).map(p => {
            const [row, col] = p.split(',').map(Number);
            return { row, col };
        });

        return { totalWin, winningPositions: winningPositionsArray };
    }

    initializeGame();
});
