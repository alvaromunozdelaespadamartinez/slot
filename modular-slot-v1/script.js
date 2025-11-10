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
    const rechargeButton = document.getElementById('recharge-button');
    const rechargeModal = document.getElementById('recharge-modal');
    const closeModalButton = document.getElementById('close-modal');
    const rechargeOptions = [
        document.getElementById('recharge-100'),
        document.getElementById('recharge-1000'),
        document.getElementById('recharge-10000'),
    ];

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

            // ... (rest of the spinReels animation logic remains the same)
            reel.innerHTML = '';
            const symbolContainer = document.createElement('div');
            reel.appendChild(symbolContainer);
            for (let i = 0; i < 50; i++) {
                const symbol = document.createElement('div');
                symbol.className = 'symbol';
                symbol.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
                symbolContainer.appendChild(symbol);
            }
            finalSymbols.forEach(s => {
                const symbol = document.createElement('div');
                symbol.className = 'symbol';
                symbol.textContent = s;
                symbolContainer.appendChild(symbol);
            });
            symbolContainer.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
            const REEL_HEIGHT = reel.clientHeight;
            const finalPosition = -(symbolContainer.scrollHeight - REEL_HEIGHT);
            symbolContainer.style.transform = `translateY(${finalPosition}px)`;
            setTimeout(() => {
                reel.innerHTML = '';
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

    const handleRecharge = (amount) => {
        balance += amount;
        updateUI(0, `Se añadieron ${amount} créditos.`);
        toggleModal(false);
    };

    const toggleModal = (show) => {
        rechargeModal.style.display = show ? 'flex' : 'none';
    };

    const updateUI = (winnings, message) => {
        balanceDisplay.textContent = balance;
        messageDisplay.textContent = message;
    };

    const initializeGame = () => {
        spinButton.addEventListener('click', spinReels);
        rechargeButton.addEventListener('click', () => toggleModal(true));
        closeModalButton.addEventListener('click', () => toggleModal(false));
        rechargeOptions.forEach(button => {
            button.addEventListener('click', () => {
                const amount = parseInt(button.dataset.amount, 10);
                handleRecharge(amount);
            });
        });
        updateUI(0, "¡Bienvenido!");
    };

    initializeGame();
});