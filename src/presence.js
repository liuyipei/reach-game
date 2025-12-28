/**
 * Presence - The player's spatial presence in the world
 *
 * Presence is a soft, organic boundary that can expand or retract.
 * - Expansion increases visible area but reduces global stability
 * - Retraction restores local clarity (slightly faster than expansion)
 */

export class Presence {
    constructor(x, y) {
        // Position (center of presence)
        this.x = x;
        this.y = y;

        // Current radius (normalized, 0-1 range where 1 = max sustainable)
        this.radius = 0.15;

        // Expansion rates
        this.expandRate = 0.12;      // Units per second
        this.retractRate = 0.18;     // Slightly faster than expansion

        // Radius constraints
        this.minRadius = 0.05;
        this.maxRadius = 0.6;

        // Current expansion state (-1 = retracting, 0 = stable, 1 = expanding)
        this.expandDirection = 0;

        // Smoothing for organic feel
        this.targetRadius = this.radius;
        this.radiusSmoothness = 8.0;  // Higher = snappier response
    }

    /**
     * Set expansion direction based on input
     * @param {number} direction - -1 (retract), 0 (stable), 1 (expand)
     */
    setExpandDirection(direction) {
        this.expandDirection = Math.max(-1, Math.min(1, direction));
    }

    /**
     * Update presence state
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Calculate target radius based on expansion direction
        if (this.expandDirection > 0) {
            this.targetRadius += this.expandRate * this.expandDirection * dt;
        } else if (this.expandDirection < 0) {
            this.targetRadius += this.retractRate * this.expandDirection * dt;
        }

        // Clamp target radius
        this.targetRadius = Math.max(this.minRadius, Math.min(this.maxRadius, this.targetRadius));

        // Smooth interpolation toward target (organic feel)
        const t = 1 - Math.exp(-this.radiusSmoothness * dt);
        this.radius += (this.targetRadius - this.radius) * t;
    }

    /**
     * Get normalized overextension (0 = safe, 1 = maximum strain)
     * @param {number} sustainableThreshold - Current sustainable threshold (0-1)
     * @returns {number} Overextension amount
     */
    getOverextension(sustainableThreshold) {
        if (this.radius <= sustainableThreshold) {
            return 0;
        }
        const overAmount = this.radius - sustainableThreshold;
        const maxOver = this.maxRadius - sustainableThreshold;
        return Math.min(1, overAmount / maxOver);
    }
}
