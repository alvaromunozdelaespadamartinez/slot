class SlotRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reels = 5;
        this.rows = 3;
        this.symbolWidth = this.canvas.width / this.reels;
        this.symbolHeight = this.canvas.height / this.rows;
        this.assets = {};
        this.assetsLoaded = false;

        // ** Asset Mapping with placeholder image sources **
        this.assetMap = {
            'SA': { name: 'Phoenix', color: '#ff4757', src: './assets/phoenix.png' },
            'SB': { name: 'Eagle', color: '#ffa502', src: './assets/eagle.png' },
            'SC': { name: 'Jaguar', color: '#eccc68', src: './assets/jaguar.png' },
            'SD': { name: 'Crystal', color: '#7bed9f', src: './assets/crystal.png' },
            'LA': { name: 'A', color: '#5352ed', src: './assets/a.png' },
            'LK': { name: 'K', color: '#3742fa', src: './assets/k.png' },
            'LQ': { name: 'Q', color: '#1e90ff', src: './assets/q.png' },
            'LJ': { name: 'J', color: '#00a8ff', src: './assets/j.png' },
            'L10': { name: '10', color: '#487eb0', src: './assets/10.png' },
            'W2': { name: 'WILD', color: '#f53b57', src: './assets/wild.png' },
            'ST': { name: 'SCATTER', color: '#e056fd', src: './assets/scatter.png' },
            'CH': { name: 'COIN', color: '#f9ca24', src: './assets/coin.png' },
            'default': { name: '?', color: '#3d3d3d', src: '' }
        };

        this.loadAssets();
    }

    /**
     * Simulates loading image assets. In a real scenario, this would handle
     * actual image loading and decoding.
     */
    async loadAssets() {
        // This is a placeholder for asset loading.
        // Since we don't have the images, we'll just mark it as "loaded"
        // so the draw logic can proceed with its fallback.
        console.log("Preparing for asset loading...");
        // In a real implementation, you would have a Promise.all here.
        this.assetsLoaded = true;
        console.log("Asset loading complete (simulation).");
    }

    drawSymbol(symbol, x, y, isWinningWild = false) {
        const asset = this.assetMap[symbol] || this.assetMap['default'];
        const image = this.assets[symbol];
        const pad = 5;
        const xPos = x * this.symbolWidth + pad;
        const yPos = y * this.symbolHeight + pad;
        const width = this.symbolWidth - (2 * pad);
        const height = this.symbolHeight - (2 * pad);

        // ** Drawing Logic: Image first, fallback to color block **
        if (this.assetsLoaded && image) {
            this.ctx.drawImage(image, xPos, yPos, width, height);
        } else {
            // Fallback rendering
            this.ctx.fillStyle = asset.color;
            this.ctx.fillRect(xPos, yPos, width, height);
        }

        // ** SCATTER Differentiation (Border) **
        if (symbol === 'ST') {
            this.ctx.strokeStyle = '#fffc00'; // High-contrast border
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(xPos, yPos, width, height);
        }

        // ** WILD x2 Rendering **
        if (symbol === 'W2') {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('WILD', (x + 0.5) * this.symbolWidth, (y + 0.45) * this.symbolHeight);

            this.ctx.fillStyle = '#fffc00';
            this.ctx.font = 'bold 30px Arial';
            this.ctx.fillText('x2', (x + 0.5) * this.symbolWidth, (y + 0.75) * this.symbolHeight);

            // ** WILD Glow Effect **
            if (isWinningWild) {
                this.highlightWinningWilds(x, y);
            }
            return; // Skip default text rendering
        }

        // Default symbol text
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(asset.name, (x + 0.5) * this.symbolWidth, (y + 0.5) * this.symbolHeight);
    }

    highlightWinningWilds(x, y) {
        const xPos = x * this.symbolWidth;
        const yPos = y * this.symbolHeight;
        this.ctx.shadowColor = '#ff8c00';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeStyle = '#ffc400';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(xPos, yPos, this.symbolWidth, this.symbolHeight);
        this.ctx.shadowBlur = 0; // Reset shadow
    }

    drawGrid(grid, winningPositions = []) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Create a quick lookup set for winning positions for efficiency
        const winningSet = new Set(winningPositions.map(p => `${p.row},${p.col}`));

        for (let row = 0; row < this.rows; row++) {
            for (let reel = 0; reel < this.reels; reel++) {
                const isWinning = winningSet.has(`${row},${reel}`);
                const symbol = grid[row][reel];
                // A WILD is only highlighted if it's part of a win
                const isWinningWild = (symbol === 'W2' && isWinning);
                this.drawSymbol(symbol, reel, row, isWinningWild);
            }
        }
    }

    drawInitialGrid() {
        // Example grid to showcase new symbols
        const initialGrid = [
            ['SA', 'LK', 'ST', 'LJ', 'W2'],
            ['SC', 'L10', 'CH', 'SD', 'LA'],
            ['SB', 'LQ', 'W2', 'SA', 'ST']
        ];
        this.drawGrid(initialGrid);
    }

    /**
     * Animates the reels stopping one by one.
     * @param {Array<Array<string>>} finalGrid - The final grid configuration from the server.
     */
    animateReelsStop(finalGrid) {
        return new Promise(resolve => {
            const reelStopDelay = 200; // ms between each reel stop
            let reelToStop = 0;

            const animation = () => {
                if (reelToStop >= this.reels) {
                    this.drawGrid(finalGrid); // Ensure final grid is perfectly drawn
                    resolve();
                    return;
                }

                // 1. Redraw the entire grid
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                // 2. Draw stopped reels with final symbols
                for (let reel = 0; reel < reelToStop; reel++) {
                    for (let row = 0; row < this.rows; row++) {
                        this.drawSymbol(finalGrid[row][reel], reel, row);
                    }
                }

                // 3. Draw "blur" for spinning reels
                const symbolKeys = Object.keys(this.assetMap);
                for (let reel = reelToStop; reel < this.reels; reel++) {
                    for (let row = 0; row < this.rows; row++) {
                        const randomSymbol = symbolKeys[Math.floor(Math.random() * symbolKeys.length)];
                        this.drawSymbol(randomSymbol, reel, row);
                    }
                }
            };

            const interval = setInterval(animation, 50);

            const stopReel = () => {
                if (reelToStop < this.reels) {
                    reelToStop++;
                    setTimeout(stopReel, reelStopDelay);
                } else {
                    clearInterval(interval);
                    // Final draw to ensure the correct grid is displayed
                    this.drawGrid(finalGrid);
                    resolve();
                }
            };

            setTimeout(stopReel, reelStopDelay);
        });
    }

    /**
     * Displays a placeholder screen for the Free Spins bonus.
     */
    runFreeSpinsBonus() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fffc00';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('FREE SPINS BONUS!', this.canvas.width / 2, this.canvas.height / 2);
    }
}
