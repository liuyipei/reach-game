/**
 * Input Handler
 *
 * Tracks mouse/touch drag direction relative to presence center.
 * - Outward drag = expand
 * - Inward drag = retract
 */

export class Input {
    constructor(canvas) {
        this.canvas = canvas;

        // Current input state
        this.isActive = false;
        this.currentPos = { x: 0, y: 0 };
        this.lastPos = { x: 0, y: 0 };

        // Expansion direction output (-1 to 1)
        this.expandDirection = 0;

        // Sensitivity
        this.sensitivity = 3.0;

        // Smoothing
        this.smoothedDirection = 0;
        this.smoothingFactor = 0.15;

        this._bindEvents();
    }

    _bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this._onStart(e.clientX, e.clientY));
        this.canvas.addEventListener('mousemove', (e) => this._onMove(e.clientX, e.clientY));
        this.canvas.addEventListener('mouseup', () => this._onEnd());
        this.canvas.addEventListener('mouseleave', () => this._onEnd());

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onStart(touch.clientX, touch.clientY);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this._onMove(touch.clientX, touch.clientY);
        });
        this.canvas.addEventListener('touchend', () => this._onEnd());
        this.canvas.addEventListener('touchcancel', () => this._onEnd());
    }

    _onStart(x, y) {
        this.isActive = true;
        this.currentPos = { x, y };
        this.lastPos = { x, y };
    }

    _onMove(x, y) {
        this.lastPos = { ...this.currentPos };
        this.currentPos = { x, y };
    }

    _onEnd() {
        this.isActive = false;
        this.expandDirection = 0;
    }

    /**
     * Update input state and calculate expansion direction
     * @param {number} presenceCenterX - Presence center X in screen coordinates
     * @param {number} presenceCenterY - Presence center Y in screen coordinates
     */
    update(presenceCenterX, presenceCenterY) {
        if (!this.isActive) {
            // Decay smoothed direction when not active
            this.smoothedDirection *= 0.85;
            this.expandDirection = this.smoothedDirection;
            return;
        }

        // Calculate drag vector
        const dx = this.currentPos.x - this.lastPos.x;
        const dy = this.currentPos.y - this.lastPos.y;

        // Calculate vector from presence center to current position
        const toCenterX = this.currentPos.x - presenceCenterX;
        const toCenterY = this.currentPos.y - presenceCenterY;

        // Normalize the center vector
        const centerDist = Math.sqrt(toCenterX * toCenterX + toCenterY * toCenterY);
        if (centerDist < 1) {
            this.expandDirection = 0;
            return;
        }

        const centerNormX = toCenterX / centerDist;
        const centerNormY = toCenterY / centerDist;

        // Project drag onto radial direction (dot product)
        // Positive = moving away from center (expand)
        // Negative = moving toward center (retract)
        const radialComponent = (dx * centerNormX + dy * centerNormY) * this.sensitivity;

        // Clamp and smooth
        const rawDirection = Math.max(-1, Math.min(1, radialComponent));
        this.smoothedDirection += (rawDirection - this.smoothedDirection) * this.smoothingFactor;
        this.expandDirection = this.smoothedDirection;
    }

    /**
     * Get the current expansion direction
     * @returns {number} Direction from -1 (retract) to 1 (expand)
     */
    getExpandDirection() {
        return this.expandDirection;
    }
}
