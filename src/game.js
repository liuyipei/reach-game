/**
 * Game State Manager
 *
 * Handles the core game loop, stability system, and win/fail conditions.
 * Uses fixed timestep for deterministic simulation.
 */

import { Presence } from './presence.js';

// Game states
export const GameState = {
    PLAYING: 'playing',
    WON: 'won',
    FAILED: 'failed'
};

export class Game {
    constructor() {
        // Core state
        this.presence = new Presence(0.5, 0.5);  // Start at center
        this.state = GameState.PLAYING;

        // Time
        this.time = 0;
        this.gameTime = 0;  // Time since game started
        this.winTime = 180; // 180 seconds to win

        // Stability system
        this.clarity = 1.0;  // Global clarity (1 = clear, 0 = unreadable)
        this.sustainableThreshold = 0.4;  // Initial sustainable radius threshold
        this.thresholdDecayRate = 0.008;  // Threshold decay per second (ensures tension)

        // Clarity dynamics
        this.clarityRecoveryRate = 0.15;   // Recovery when not overextended
        this.clarityDecayRate = 0.25;      // Decay when overextended
        this.clarityMinRecovery = 0.3;     // Minimum clarity to recover to

        // Failure threshold
        this.failureClarity = 0.15;  // Below this, game is lost

        // Fixed timestep
        this.fixedDt = 1 / 60;  // 60 Hz simulation
        this.accumulator = 0;
    }

    /**
     * Update game state with variable timestep
     * @param {number} dt - Delta time in seconds
     * @param {number} expandDirection - Input direction (-1 to 1)
     */
    update(dt, expandDirection) {
        if (this.state !== GameState.PLAYING) {
            return;
        }

        this.time += dt;
        this.accumulator += dt;

        // Fixed timestep simulation
        while (this.accumulator >= this.fixedDt) {
            this._fixedUpdate(this.fixedDt, expandDirection);
            this.accumulator -= this.fixedDt;
        }
    }

    /**
     * Fixed timestep update (deterministic)
     */
    _fixedUpdate(dt, expandDirection) {
        this.gameTime += dt;

        // Update presence
        this.presence.setExpandDirection(expandDirection);
        this.presence.update(dt);

        // Decay sustainable threshold over time (ensures tension never disappears)
        this.sustainableThreshold = Math.max(
            0.1,
            this.sustainableThreshold - this.thresholdDecayRate * dt
        );

        // Calculate overextension
        const overextension = this.presence.getOverextension(this.sustainableThreshold);

        // Update clarity based on overextension
        if (overextension > 0) {
            // Overextended: clarity decays
            const decayAmount = this.clarityDecayRate * overextension * dt;
            this.clarity = Math.max(0, this.clarity - decayAmount);
        } else {
            // Not overextended: clarity slowly recovers
            const targetClarity = Math.max(this.clarityMinRecovery, 1 - (this.gameTime / this.winTime) * 0.3);
            if (this.clarity < targetClarity) {
                this.clarity = Math.min(targetClarity, this.clarity + this.clarityRecoveryRate * dt);
            }
        }

        // Check win condition
        if (this.gameTime >= this.winTime) {
            this.state = GameState.WON;
        }

        // Check fail condition
        if (this.clarity <= this.failureClarity) {
            this.state = GameState.FAILED;
        }
    }

    /**
     * Get current render state
     */
    getRenderState() {
        return {
            presence: {
                x: this.presence.x,
                y: this.presence.y,
                radius: this.presence.radius
            },
            clarity: this.clarity,
            time: this.time,
            gameTime: this.gameTime,
            state: this.state,
            sustainableThreshold: this.sustainableThreshold
        };
    }

    /**
     * Reset the game
     */
    reset() {
        this.presence = new Presence(0.5, 0.5);
        this.state = GameState.PLAYING;
        this.time = 0;
        this.gameTime = 0;
        this.clarity = 1.0;
        this.sustainableThreshold = 0.4;
    }

    /**
     * Get progress toward win (0-1)
     */
    getProgress() {
        return Math.min(1, this.gameTime / this.winTime);
    }
}
