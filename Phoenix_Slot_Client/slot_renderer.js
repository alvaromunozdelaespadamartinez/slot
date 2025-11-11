class SlotRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reels = 5;
        this.rows = 3;
        this.symbolWidth = this.canvas.width / this.reels;
        this.symbolHeight = this.canvas.height / this.rows;

        // Predefined symbol colors for variety
        this.symbolColors = {
            'SA': '#ff4757', 'SB': '#ffa502', 'SC': '#eccc68', 'SD': '#7bed9f',
            'LA': '#5352ed', 'LK': '#3742fa', 'LQ': '#1e90ff', 'LJ': '#00a8ff', 'L10': '#487eb0',
            'W2': '#f53b57', 'ST': '#e056fd', 'CH': '#f9ca24', 'default': '#3d3d3d'
        };
    }

    // Draws a single symbol at a specific grid location
    drawSymbol(symbol, x, y) {
        const color = this.symbolColors[symbol] || this.symbolColors['default'];
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.symbolWidth, y * this.symbolHeight, this.symbolWidth - 5, this.symbolHeight - 5);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, (x + 0.5) * this.symbolWidth, (y + 0.5) * this.symbolHeight);
    }

    // Draws the entire 5x3 grid based on a 2D array of symbols
    drawGrid(grid) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let row = 0; row < this.rows; row++) {
            for (let reel = 0; reel < this.reels; reel++) {
                this.drawSymbol(grid[row][reel], reel, row);
            }
        }
    }

    // Draws the initial grid when the page loads
    drawInitialGrid() {
        const initialGrid = [
            ['-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-'],
            ['-', '-', '-', '-', '-']
        ];
        this.drawGrid(initialGrid);
    }

    // Simulates a reel spin animation and stops at the final positions
    async animateReelsStop(finalPositions) {
        const animationDuration = 2000; // 2 seconds total animation
        const reelStopTime = 300; // ms delay between each reel stopping
        const startTime = Date.now();

        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= animationDuration) {
                // Final draw based on the server-provided indices
                const finalGrid = this.createGridFromIndices(finalPositions);
                this.drawGrid(finalGrid);
                return;
            }

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const placeholderSymbols = ['SA', 'LK', 'SC', 'LJ', 'W2', 'ST', 'SD', 'L10'];

            for (let row = 0; row < this.rows; row++) {
                for (let reel = 0; reel < this.reels; reel++) {
                    // If the reel's stop time has passed, draw the final symbol
                    if (elapsedTime > (reel * reelStopTime)) {
                        const finalSymbol = `S${finalPositions[reel]}`; // Placeholder for final symbol
                        this.drawSymbol(finalSymbol, reel, row);
                    } else {
                        // Otherwise, draw a random "blurring" symbol
                        const randomSymbol = placeholderSymbols[Math.floor(Math.random() * placeholderSymbols.length)];
                        this.drawSymbol(randomSymbol, reel, row);
                    }
                }
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    // Helper function to create a display grid from indices
    createGridFromIndices(indices) {
        // In a real game, this would use the reel strips to get the symbols
        // For now, we create placeholder text to show the outcome is unique
        return [
            [`S${indices[0]-1}`, `S${indices[1]-1}`, `S${indices[2]-1}`, `S${indices[3]-1}`, `S${indices[4]-1}`],
            [`S${indices[0]}`, `S${indices[1]}`, `S${indices[2]}`, `S${indices[3]}`, `S${indices[4]}`],
            [`S${indices[0]+1}`, `S${indices[1]+1}`, `S${indices[2]+1}`, `S${indices[3]+1}`, `S${indices[4]+1}`]
        ];
    }

    // Displays a message on the canvas to indicate a feature trigger
    animateFeatureTrigger(featureName) {
        return new Promise(resolve => {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(`${featureName} Triggered!`, this.canvas.width / 2, this.canvas.height / 2);

            setTimeout(() => {
                this.drawInitialGrid(); // Clear the message after a delay
                resolve();
            }, 2000); // Display message for 2 seconds
        });
    }

    // Placeholder for Free Spins bonus round
    runFreeSpinsBonus() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fffc00';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Free Spins Round in Progress", this.canvas.width / 2, this.canvas.height / 2);
    }

    // Placeholder for Money Respin bonus round
    runMoneyRespinBonus() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ff8c00';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText("Money Respin Round in Progress", this.canvas.width / 2, this.canvas.height / 2);
    }
}
