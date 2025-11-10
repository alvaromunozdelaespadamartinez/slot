document.addEventListener('DOMContentLoaded', () => {
    // Game Constants
    const REELS_COUNT = 5;
    const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '⭐', '７'];
    const SPIN_COST = 10;
    const SYMBOL_BASE_VALUE = 1;
    const PAYOUT_RULES = {
        5: 15, // match_count: reward_multiplier
        4: 5,
        3: 2,
    };

    // DOM Elements
    const reels = Array.from({ length: REELS_COUNT }, (_, i) => document.getElementById(`reel-${i + 1}`));
    const spinButton = document.getElementById('botonGirar');
    const balanceDisplay = document.getElementById('saldo');
    const messageDisplay = document.getElementById('mensaje');

    // Game State
    let balance = 100;
    let isSpinning = false;

    const spinReels = () => {
        if (isSpinning) return;
        if (balance < SPIN_COST) {
            updateUI(0, "Saldo insuficiente para girar.");
            return;
        }

        isSpinning = true;
        balance -= SPIN_COST;
        updateUI(0, "Girando...");

        let completedReels = 0;
        const finalReelSymbols = [];

        reels.forEach((reel, index) => {
            const duration = 2000 + index * 500; // Staggered stop
            const finalSymbols = Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            finalReelSymbols.push(finalSymbols);

            // Clear previous symbols
            reel.innerHTML = '';

            // Create a container for symbols to animate
            const symbolContainer = document.createElement('div');
            reel.appendChild(symbolContainer);

            // Populate with random symbols for animation
            for (let i = 0; i < 50; i++) {
                const symbol = document.createElement('div');
                symbol.className = 'symbol';
                symbol.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                symbolContainer.appendChild(symbol);
            }

            // Add final symbols at the end
            finalSymbols.forEach(s => {
                const symbol = document.createElement('div');
                symbol.className = 'symbol';
                symbol.textContent = s;
                symbolContainer.appendChild(symbol);
            });

            // Animate
            symbolContainer.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
            const REEL_HEIGHT = reel.clientHeight;
            const finalPosition = -(symbolContainer.scrollHeight - REEL_HEIGHT);
            symbolContainer.style.transform = `translateY(${finalPosition}px)`;

            // After animation, clean up and set final state
            setTimeout(() => {
                reel.innerHTML = ''; // Clear animation symbols
                finalSymbols.forEach(s => {
                    const symbol = document.createElement('div');
                    symbol.className = 'symbol';
                    symbol.textContent = s;
                    reel.appendChild(symbol);
                });
                completedReels++;
                if (completedReels === REELS_COUNT) {
                    checkPaylines(finalReelSymbols);
                    isSpinning = false;
                }
            }, duration);
        });
    };

    const checkPaylines = (finalReels) => {
        let totalWinnings = 0;
        const paylines = [
            finalReels.map(reel => reel[0]), // Top line
            finalReels.map(reel => reel[1]), // Middle line
            finalReels.map(reel => reel[2]), // Bottom line
        ];

        paylines.forEach(line => {
            let consecutiveCount = 0;
            const firstSymbol = line[0];
            for (const symbol of line) {
                if (symbol === firstSymbol) {
                    consecutiveCount++;
                } else {
                    break;
                }
            }

            if (PAYOUT_RULES[consecutiveCount]) {
                const winAmount = SYMBOL_BASE_VALUE * PAYOUT_RULES[consecutiveCount];
                totalWinnings += winAmount;
            }
        });

        balance += totalWinnings;
        if (totalWinnings > 0) {
            updateUI(totalWinnings, `¡Ganaste ${totalWinnings} créditos!`);
        } else {
            updateUI(0, "¡Inténtalo de nuevo!");
        }
    };

    const updateUI = (winnings, message) => {
        balanceDisplay.textContent = balance;
        messageDisplay.textContent = message;
    };

    // Initial setup
    spinButton.addEventListener('click', spinReels);
    updateUI(0, "¡Bienvenido!");
});