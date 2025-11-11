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
    const reelStripLength = 128;

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

    function initializeGame() {
        balanceAmountSpan.textContent = balance.toFixed(2);
        renderer.drawInitialGrid();
    }

    function simulateServerResponse() {
        return new Promise(resolve => {
            const initial_reel_indices = Array.from({ length: 5 }, () => Math.floor(Math.random() * reelStripLength));
            const response = {
                initial_reel_indices: initial_reel_indices,
                total_win_amount: 0.00,
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
        await renderer.animateReelsStop(spinResult.initial_reel_indices);

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
