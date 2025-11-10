document.addEventListener('DOMContentLoaded', () => {
    const REELS_COUNT = 5;
    const SYMBOLS = ['🍒', '🍋', '🍊', '🍉', '🍇', '🔔', '⭐', '７'];
    const REEL_HEIGHT = 300; // As defined in CSS
    const SYMBOL_HEIGHT = 100; // As defined in CSS for .symbol line-height

    const reels = [];
    for (let i = 1; i <= REELS_COUNT; i++) {
        reels.push(document.getElementById(`reel-${i}`));
    }
    const spinButton = document.getElementById('botonGirar');
    const balanceDisplay = document.getElementById('saldo');
    const messageDisplay = document.getElementById('mensaje');

    let balance = 100;

    const spin = () => {
        if (balance <= 0) {
            messageDisplay.textContent = "No tienes saldo para girar.";
            return;
        }
        balance -= 1;
        updateBalance();
        messageDisplay.textContent = "";

        let completedReels = 0;

        reels.forEach((reel, index) => {
            const duration = 2000 + index * 500; // Staggered stop
            const finalSymbols = Array.from({ length: 3 }, () => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);

            // Clear previous symbols
            reel.innerHTML = '';

            // Create a container for symbols to animate
            const symbolContainer = document.createElement('div');
            reel.appendChild(symbolContainer);

            // Populate with random symbols for animation
            for (let i = 0; i < 50; i++) { // More symbols for a better blur effect
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
                    checkWin(reels.map(r => Array.from(r.children).map(c => c.textContent)));
                }
            }, duration);
        });
    };

    const checkWin = (finalReelSymbols) => {
        // For this iteration, we'll just check the middle line
        const middleSymbols = finalReelSymbols.map(reel => reel[1]);

        let win = false;
        if (middleSymbols.every(s => s === middleSymbols[0])) {
            win = true;
            balance += 50; // Simple win amount
            messageDisplay.textContent = "¡Ganaste 50 créditos!";
        } else {
             messageDisplay.textContent = "¡Inténtalo de nuevo!";
        }
        updateBalance();
    };

    const updateBalance = () => {
        balanceDisplay.textContent = balance;
    };

    spinButton.addEventListener('click', spin);
    updateBalance();
});
