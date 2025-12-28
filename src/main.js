/**
 * Reach - Main Entry Point
 *
 * A meditative browser game about managing spatial presence.
 * The map is the UI.
 */

import { Game, GameState } from './game.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';

class ReachGame {
    constructor() {
        this.canvas = document.getElementById('game');
        this.renderer = new Renderer(this.canvas);
        this.input = new Input(this.canvas);
        this.game = new Game();

        this.lastTime = 0;
        this.isRunning = false;

        // Bind click to restart when game ends
        this.canvas.addEventListener('click', () => {
            if (this.game.state !== GameState.PLAYING) {
                this.game.reset();
            }
        });
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this._loop(t));
    }

    _loop(currentTime) {
        if (!this.isRunning) return;

        // Calculate delta time (capped to prevent spiral of death)
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;

        // Get presence center in screen coordinates for input
        const dims = this.renderer.getDimensions();
        const renderState = this.game.getRenderState();
        const presenceScreenX = renderState.presence.x * dims.width;
        const presenceScreenY = (1 - renderState.presence.y) * dims.height; // Flip Y

        // Update input
        this.input.update(presenceScreenX, presenceScreenY);

        // Update game
        this.game.update(dt, this.input.getExpandDirection());

        // Render
        this.renderer.render(this.game.getRenderState());

        // Continue loop
        requestAnimationFrame((t) => this._loop(t));
    }
}

// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const game = new ReachGame();
        game.start();
    });
} else {
    const game = new ReachGame();
    game.start();
}
