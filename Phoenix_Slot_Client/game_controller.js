document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('slot-canvas');
    const spinButton = document.getElementById('spin-button');
    const balanceAmountSpan = document.getElementById('balance-amount');
    const buyFreeSpinsButton = document.getElementById('buy-freespins-button');
    const buyRespinButton = document.getElementById('buy-respin-button');

    if (!canvas || !spinButton || !balanceAmountSpan || !buyFreeSpinsButton || !buyRespinButton) {
        console.error('Essential DOM elements are missing!');
        return;
    }

    const renderer = new SlotRenderer(canvas);
    let balance = 100.00;
    let isSpinning = false;
    const betAmount = 1.00; // Fixed bet for now
    const reelStripLength = 128; // As defined in the server blueprint

    /**
     * Initializes the game state and draws the initial grid.
     */
    function initializeGame() {
        balanceAmountSpan.textContent = balance.toFixed(2);
        renderer.drawInitialGrid();
    }

    /**
     * Simulates a standard spin response from the server.
     */
    function simulateServerResponse() {
        return new Promise(resolve => {
            const initial_reel_indices = Array.from({ length: 5 }, () => Math.floor(Math.random() * reelStripLength));
            const response = {
                new_balance: balance,
                initial_reel_indices: initial_reel_indices,
                total_win_amount: 0.00,
                free_spins_awarded: 0
            };
            setTimeout(() => resolve(response), 200);
        });
    }

    /**
     * Handles the main spin execution flow.
     */
    async function handleSpin() {
        if (isSpinning) return;
        if (balance < betAmount) {
            alert('Insufficient funds to spin.');
            return;
        }

        isSpinning = true;
        setControlsDisabled(true);

        balance -= betAmount;
        balanceAmountSpan.textContent = balance.toFixed(2);

        const spinResult = await simulateServerResponse();
        await renderer.animateReelsStop(spinResult.initial_reel_indices);

        setTimeout(() => {
            balance += spinResult.total_win_amount;
            balanceAmountSpan.textContent = balance.toFixed(2);
            isSpinning = false;
            setControlsDisabled(false);
        }, 2100);
    }

    /**
     * Handles the purchase of the Free Spins feature.
     */
    async function handleBuyFreeSpins() {
        if (isSpinning) return;
        const cost = 100 * betAmount;
        if (balance < cost) {
            alert('Insufficient funds for Buy Feature.');
            return;
        }

        isSpinning = true;
        setControlsDisabled(true);

        balance -= cost;
        balanceAmountSpan.textContent = balance.toFixed(2);

        // Here we would normally call the EXECUTE_BUY_FREE_SPINS endpoint.
        // For simulation, we trigger a visual confirmation and then the bonus mode.
        console.log('Free Spins Purchased!');
        await renderer.animateFeatureTrigger("Free Spins");

        // Enter the bonus mode
        renderer.runFreeSpinsBonus();

        // Note: In a real game, controls would be re-enabled after the bonus round concludes.
        // For this simulation, we leave them disabled to show the bonus is "active".
    }

    /**
     * Handles the purchase of the Money Respin feature.
     */
    async function handleBuyMoneyRespin() {
        if (isSpinning) return;
        const cost = 80 * betAmount;
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

        // Enter the bonus mode
        renderer.runMoneyRespinBonus();
    }

    /**
     * Toggles the disabled state of all control buttons.
     */
    function setControlsDisabled(state) {
        spinButton.disabled = state;
        buyFreeSpinsButton.disabled = state;
        buyRespinButton.disabled = state;
    }

    // Attach event listeners
    spinButton.addEventListener('click', handleSpin);
    buyFreeSpinsButton.addEventListener('click', handleBuyFreeSpins);
    buyRespinButton.addEventListener('click', handleBuyMoneyRespin);

    // Start the game
    initializeGame();
});
