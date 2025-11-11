document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('slot-canvas');
    const spinButton = document.getElementById('spin-button');
    const balanceSpan = document.getElementById('balance');

    const renderer = new SlotRenderer(canvas);

    // --- Client-Side Game State ---
    let balance = 100.00;
    let isSpinning = false;

    // Initial grid display
    const initialGrid = [
        ['SA', 'SB', 'SC', 'SD', 'LA'],
        ['LK', 'LQ', 'LJ', 'L10', 'W2'],
        ['ST', 'CH', 'SA', 'SB', 'SC']
    ];
    renderer.drawGrid(initialGrid);

    // --- Server Communication Simulation ---
    async function getSpinResultFromServer() {
        console.log("Controller: Requesting spin result from server...");
        // In a real application, this would be a fetch() call to the backend.
        // Here, we simulate a delay and return a static JSON object.
        return new Promise(resolve => {
            setTimeout(() => {
                const simulatedResponse = {
                    // This data would come from the Phoenix_Slot_Engine_V1
                    finalGrid: [
                        ['LA', 'LK', 'LQ', 'LJ', 'L10'],
                        ['SA', 'SB', 'W2', 'SD', 'LA'],
                        ['CH', 'ST', 'SC', 'SA', 'SB']
                    ],
                    winAmount: 12.50,
                    paylineWins: [{ line: 3, symbols: "3x_A" }], // For future use
                    freeSpinsTriggered: false
                };
                console.log("Controller: Received response from server:", simulatedResponse);
                resolve(simulatedResponse);
            }, 500); // 500ms simulated network latency
        });
    }

    // --- Main Game Loop ---
    async function handleSpin() {
        if (isSpinning) return;

        const spinCost = 1.00; // Assuming a fixed bet for now
        if (balance < spinCost) {
            alert("Insufficient balance!");
            return;
        }

        isSpinning = true;
        spinButton.disabled = true;
        balance -= spinCost;
        updateBalance();

        const result = await getSpinResultFromServer();

        // Use the renderer to animate the spin to the final state
        renderer.animateSpin(result.finalGrid);

        // After the animation is visually complete, update the balance with winnings
        setTimeout(() => {
            balance += result.winAmount;
            updateBalance();

            if (result.winAmount > 0) {
                console.log(`Congratulations! You won ${result.winAmount.toFixed(2)}`);
            }

            if (result.freeSpinsTriggered) {
                alert("Free Spins Triggered!");
            }

            isSpinning = false;
            spinButton.disabled = false;
        }, 1200); // Wait for the reel animation (5 reels * 200ms) + buffer
    }

    function updateBalance() {
        balanceSpan.textContent = balance.toFixed(2);
    }

    // --- Event Listeners ---
    spinButton.addEventListener('click', handleSpin);
});
