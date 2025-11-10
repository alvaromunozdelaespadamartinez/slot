document.addEventListener('DOMContentLoaded', () => {
    // Game Constants
    const REELS_COUNT = 5;
    const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '⭐', '７', '💎'];
    const SCATTER_SYMBOL = '💎';
    const SELECTABLE_BET_VALUES = [10, 50, 90, 130, 170, 210, 250];
    const SYMBOL_BASE_VALUE = 1;
    const PAYOUT_RULES = { 5: 15, 4: 5, 3: 2 };

    // DOM Elements
    const reels = Array.from({ length: REELS_COUNT }, (_, i) => document.getElementById(`reel-${i + 1}`));
    const spinButton = document.getElementById('botonGirar');
    const balanceDisplay = document.getElementById('saldo');
    const messageDisplay = document.getElementById('mensaje');
    const rechargeButton = document.getElementById('recharge-button');
    const rechargeModal = document.getElementById('recharge-modal');
    const closeModalButton = document.getElementById('close-modal');
    const rechargeOptions = Array.from(document.querySelectorAll('[id^="recharge-"]'));
    const betOptions = document.querySelectorAll('.bet-option');
    const betDisplay = document.getElementById('bet-display');
    const bonusSlots = document.querySelectorAll('.bonus-slot');
    const buyBonusButton = document.getElementById('buy-bonus-button');
    const buyModal = document.getElementById('buy-modal');
    const closeBuyModalButton = document.getElementById('close-buy-modal');
    const buyOptions = document.querySelectorAll('.buy-option');

    const BONUS_BUY_COSTS = { 3: 50, 5: 150 };

    // Game State
    let balance = 100;
    let currentBet = 10;
    let scatterCount = 0;
    let gameState = 'IDLE'; // IDLE, SPINNING, CHECKING, CASCADING

    // Main Game Cycle
    const startGameCycle = async () => {
        if (gameState !== 'IDLE') return;
        if (balance < currentBet) {
            updateUI("Saldo insuficiente.");
            return;
        }

        gameState = 'SPINNING';
        balance -= currentBet;
        scatterCount = 0;
        updateUI("Girando...");
        updateBonusBar();

        await spinReels();

        gameState = 'CHECKING';
        await processWinsAndCascades();

        if (gameState !== 'IDLE') { // Ensure we don't overwrite a bonus message
            updateUI("¡Inténtalo de nuevo!");
        }
        gameState = 'IDLE';
    };

    const spinReels = () => {
        const promises = reels.map((reel, index) => {
            return new Promise(resolve => {
                const duration = 2000 + index * 500;
                reel.innerHTML = '';
                const symbolContainer = document.createElement('div');
                reel.appendChild(symbolContainer);

                for (let i = 0; i < 50; i++) addSymbol(symbolContainer);
                const finalSymbols = Array.from({ length: 3 }, () => createSymbol());
                finalSymbols.forEach(s => symbolContainer.appendChild(s));

                const finalPosition = -(symbolContainer.scrollHeight - reel.clientHeight);
                symbolContainer.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
                symbolContainer.style.transform = `translateY(${finalPosition}px)`;

                setTimeout(() => {
                    reel.innerHTML = '';
                    finalSymbols.forEach(s => reel.appendChild(s));
                    resolve();
                }, duration);
            });
        });
        return Promise.all(promises);
    };

    const processWinsAndCascades = async () => {
        let wins = checkPaylines();
        while (wins.totalWinnings > 0) {
            balance += wins.totalWinnings;
            scatterCount += wins.scatters;
            updateUI(`¡Ganaste ${wins.totalWinnings}!`);
            updateBonusBar();

            await handleCascade(wins.winningCoords);
            wins = checkPaylines();
        }
        triggerBonus(scatterCount);
    };

    const triggerBonus = (scatters) => {
        if (scatters >= 3) {
            updateUI("¡RONDA DE BONIFICACIÓN ACTIVADA!");
            // Future logic for the bonus round will go here.
        }
    };

    const checkPaylines = () => {
        let baseWinnings = 0;
        let scatters = 0;
        const winningCoords = new Set();
        const finalReels = reels.map(r => Array.from(r.children).map(c => c.textContent));

        const paylines = [
            finalReels.map(reel => reel[0]),
            finalReels.map(reel => reel[1]),
            finalReels.map(reel => reel[2]),
        ];

        paylines.forEach((line, lineIndex) => {
            let consecutiveCount = 0;
            const firstSymbol = line[0];
            for (const symbol of line) {
                if (symbol === firstSymbol) consecutiveCount++;
                else break;
            }

            if (PAYOUT_RULES[consecutiveCount]) {
                baseWinnings += SYMBOL_BASE_VALUE * PAYOUT_RULES[consecutiveCount];
                for (let i = 0; i < consecutiveCount; i++) {
                    winningCoords.add(`${i},${lineIndex}`);
                    if (line[i] === SCATTER_SYMBOL) scatters++;
                }
            }
        });

        return { totalWinnings: baseWinnings * currentBet, scatters, winningCoords: Array.from(winningCoords) };
    };

    const handleCascade = async (coords) => {
        // Fade out winning symbols
        coords.forEach(coord => {
            const [reelIndex, symbolIndex] = coord.split(',').map(Number);
            reels[reelIndex].children[symbolIndex].classList.add('fade-out');
        });

        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for fade out animation

        reels.forEach((reel, reelIndex) => {
            const remainingSymbols = Array.from(reel.children).filter(s => !s.classList.contains('fade-out'));
            reel.innerHTML = '';

            const newSymbolsCount = 3 - remainingSymbols.length;
            for (let i = 0; i < newSymbolsCount; i++) {
                const newSymbol = createSymbol();
                newSymbol.classList.add('drop-in');
                reel.appendChild(newSymbol);
            }
            remainingSymbols.forEach(s => reel.appendChild(s));
        });

        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for drop in animation
    };

    // UI and Helper Functions
    const createSymbol = () => {
        const symbol = document.createElement('div');
        symbol.className = 'symbol';
        symbol.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        return symbol;
    };

    const addSymbol = (container) => container.appendChild(createSymbol());

    const updateUI = (message) => {
        balanceDisplay.textContent = balance;
        if(message) messageDisplay.textContent = message;
    };

    const updateBonusBar = () => {
        bonusSlots.forEach((slot, i) => {
            slot.textContent = i < scatterCount ? SCATTER_SYMBOL : '';
        });
    };

    const handleBetChange = (newBet) => {
        currentBet = newBet;
        betDisplay.textContent = currentBet;
        betOptions.forEach(opt => opt.classList.toggle('selected', parseInt(opt.dataset.bet) === newBet));
        updateBonusBuyModal();
    };

    const updateBonusBuyModal = () => {
        buyOptions.forEach(button => {
            const scatters = parseInt(button.dataset.scatters, 10);
            const cost = BONUS_BUY_COSTS[scatters] * currentBet;
            button.querySelector('.cost-display').textContent = cost;
        });
    };

    const handleRecharge = (amount) => {
        balance += amount;
        updateUI(`Se añadieron ${amount} créditos.`);
        toggleModal('recharge', false);
    };

    const handleBonusBuy = (scatterAmount) => {
        const cost = BONUS_BUY_COSTS[scatterAmount] * currentBet;
        if (balance >= cost) {
            balance -= cost;
            toggleModal('buy', false);
            updateUI(`Compra de bono exitosa por ${cost}.`);
            // Directly trigger the bonus round effects
            triggerBonus(scatterAmount);
        } else {
            updateUI("Saldo insuficiente para comprar el bono.");
        }
    };

    const toggleModal = (modalType, show) => {
        const modal = modalType === 'recharge' ? rechargeModal : document.getElementById('buy-modal');
        if (modal) modal.style.display = show ? 'flex' : 'none';
    };

    // Initialization
    const initializeGame = () => {
        spinButton.addEventListener('click', startGameCycle);
        rechargeButton.addEventListener('click', () => toggleModal('recharge', true));
        closeModalButton.addEventListener('click', () => toggleModal('recharge', false));
        buyBonusButton.addEventListener('click', () => {
            updateBonusBuyModal();
            toggleModal('buy', true);
        });
        closeBuyModalButton.addEventListener('click', () => toggleModal('buy', false));

        rechargeOptions.forEach(button => {
            button.addEventListener('click', () => handleRecharge(parseInt(button.dataset.amount, 10)));
        });
        betOptions.forEach(button => {
            button.addEventListener('click', () => handleBetChange(parseInt(button.dataset.bet, 10)));
        });
        buyOptions.forEach(button => {
            button.addEventListener('click', () => handleBonusBuy(parseInt(button.dataset.scatters, 10)));
        });
        handleBetChange(currentBet);
        updateBonusBuyModal();
        updateUI("¡Bienvenido!");
    };

    initializeGame();
});