class SlotRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reels = 5;
        this.rows = 3;
        this.symbolSize = 100;

        // Simple visual representation for each symbol
        this.symbolMap = {
            'SA': { color: '#ff4136', display: 'A' },
            'SB': { color: '#0074d9', display: 'B' },
            'SC': { color: '#2ecc40', display: 'C' },
            'SD': { color: '#ffdc00', display: 'D' },
            'LA': { color: '#b10dc9', display: 'A' },
            'LK': { color: '#f012be', display: 'K' },
            'LQ': { color: '#7fdbff', display: 'Q' },
            'LJ': { color: '#39cccc', display: 'J' },
            'L10': { color: '#3d9970', display: '10' },
            'W2': { color: '#ffffff', display: 'W x2' },
            'ST': { color: '#ff851b', display: 'S' },
            'CH': { color: '#85144b', display: '$' },
            'BLUR': { color: '#555555', display: '' }, // For spin animation
        };
    }

    drawSymbol(symbol, x, y) {
        const symbolStyle = this.symbolMap[symbol] || { color: '#aaaaaa', display: '?' };

        this.ctx.fillStyle = symbolStyle.color;
        this.ctx.fillRect(x * this.symbolSize, y * this.symbolSize, this.symbolSize, this.symbolSize);
        this.ctx.strokeRect(x * this.symbolSize, y * this.symbolSize, this.symbolSize, this.symbolSize);

        this.ctx.fillStyle = '#000';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbolStyle.display, (x * this.symbolSize) + this.symbolSize / 2, (y * this.symbolSize) + this.symbolSize / 2);
    }

    drawGrid(grid) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let row = 0; row < this.rows; row++) {
            for (let reel = 0; reel < this.reels; reel++) {
                this.drawSymbol(grid[row][reel], reel, row);
            }
        }
    }

    // Placeholder for a more complex spin animation
    animateSpin(finalGrid) {
        console.log("Renderer: Starting spin animation...");
        let stopReel = 0;
        const animationInterval = setInterval(() => {
            const tempGrid = [];
            for (let row = 0; row < this.rows; row++) {
                tempGrid[row] = [];
                for (let reel = 0; reel < this.reels; reel++) {
                    if (reel < stopReel) {
                        tempGrid[row][reel] = finalGrid[row][reel];
                    } else {
                        // Show a blur effect for spinning reels
                        const randomSymbol = Object.keys(this.symbolMap)[Math.floor(Math.random() * 10)];
                        tempGrid[row][reel] = randomSymbol;
                    }
                }
            }
            this.drawGrid(tempGrid);

            if (stopReel < this.reels) {
                stopReel++;
            } else {
                clearInterval(animationInterval);
                console.log("Renderer: Spin animation finished.");
                this.drawGrid(finalGrid);
                this.highlightWinningPaylines(); // Placeholder call
            }
        }, 200); // Stop one reel every 200ms
    }

    // Placeholder for highlighting wins
    highlightWinningPaylines(paylines = []) {
        console.log("Renderer: Highlighting winning paylines (placeholder).");
        this.ctx.strokeStyle = '#ffc107';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.symbolSize * 1.5);
        this.ctx.lineTo(this.canvas.width, this.symbolSize * 1.5);
        this.ctx.stroke();
    }
}
