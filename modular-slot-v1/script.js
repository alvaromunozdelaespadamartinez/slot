document.addEventListener('DOMContentLoaded', () => {
    // Game Constants
    const REELS_COUNT = 5;
    const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '⭐', '７'];
    const SELECTABLE_BET_VALUES = [10, 50, 90, 130, 170, 210, 250];
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
    const betOptions = document.querySelectorAll('.bet-option');
    const betDisplay = document.getElementById('bet-display');

    // Game State
    let balance = 100;
    let currentBet = 10;
    let isSpinning = false;

    const spinReels = () => {
        if (isSpinning) return;
        if (balance < currentBet) {
            updateUI(0, "Saldo insuficiente para girar.");
            return;
        }

        isSpinning = true;
        balance -= currentBet;
        updateUI(0, "Girando...");

        let completedReels = 0;
        const finalReelSymbols = [];

        reels.forEach((reel, index) => {
            const duration = 2000 + index * 500;
            const finalSymbols = Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            finalReelSymbols.push(finalSymbols);

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
        let baseWinnings = 0;
        const paylines = [
            finalReels.map(reel => reel[0]),
            finalReels.map(reel => reel[1]),
            finalReels.map(reel => reel[2]),
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
                baseWinnings += winAmount;
            }
        });

        const totalWinnings = baseWinnings * currentBet;
        balance += totalWinnings;

        if (totalWinnings > 0) {
            updateUI(totalWinnings, `¡Ganaste ${totalWinnings} créditos!`);
        } else {
            updateUI(0, "¡Inténtalo de nuevo!");
        }
    };

    const handleBetChange = (newBet) => {
        currentBet = newBet;
        betDisplay.textContent = currentBet;
        betOptions.forEach(opt => {
            opt.classList.toggle('selected', parseInt(opt.dataset.bet) === newBet);
        });
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
        betOptions.forEach(button => {
            button.addEventListener('click', () => {
                const bet = parseInt(button.dataset.bet, 10);
                handleBetChange(bet);
            });
        });
        handleBetChange(currentBet); // Set initial bet display
        updateUI(0, "¡Bienvenido!");
    };

    initializeGame();
});