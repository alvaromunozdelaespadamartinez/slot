document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('slot-canvas');
    const spinButton = document.getElementById('spin-button');
    const balanceAmountSpan = document.getElementById('balance-amount');

    if (!canvas || !spinButton || !balanceAmountSpan) {
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
     * CRITICAL LOGIC: Simulates a response from the server.
     * This function generates a UNIQUE, hardcoded JSON response every time it is called
     * by randomizing the 'initial_reel_indices'. This fixes the "stuck screen" problem.
     * @returns {Promise<object>} A promise that resolves with the simulated server response.
     */
    function simulateServerResponse() {
        return new Promise(resolve => {
            // Generate 5 unique, random reel stop indices
            const initial_reel_indices = Array.from(
                { length: 5 },
                () => Math.floor(Math.random() * reelStripLength)
            );

            const response = {
                new_balance: balance, // This will be updated after the spin result
                initial_reel_indices: initial_reel_indices,
                total_win_amount: 0.00, // For now, no wins are simulated
                free_spins_awarded: 0
            };

            // Simulate network latency
            setTimeout(() => {
                resolve(response);
            }, 200);
        });
    }

    /**
     * Handles the main spin execution flow.
     */
    async function handleSpin() {
        if (isSpinning) {
            console.log('Spin already in progress.');
            return;
        }

        if (balance < betAmount) {
            console.error('Insufficient balance.');
            alert('You have insufficient funds to spin.');
            return;
        }

        isSpinning = true;
        spinButton.disabled = true;

        // 1. Debit the bet
        balance -= betAmount;
        balanceAmountSpan.textContent = balance.toFixed(2);

        // 2. Get the unique spin outcome from the simulated server
        const spinResult = await simulateServerResponse();

        // 3. Animate the reels to the server-defined positions
        await renderer.animateReelsStop(spinResult.initial_reel_indices);

        // 4. Wait for animation to finish and then update final balance
        setTimeout(() => {
            balance += spinResult.total_win_amount;
            balanceAmountSpan.textContent = balance.toFixed(2);
            isSpinning = false;
            spinButton.disabled = false;
        }, 2100); // A little longer than the animation duration
    }

    // Attach the event listener to the spin button
    spinButton.addEventListener('click', handleSpin);

    // Start the game
    initializeGame();
});
