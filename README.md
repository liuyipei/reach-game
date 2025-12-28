# Reach — Specification Document (v0.1)

## Background

This project began with the goal of building a browser-based game that demonstrates not only technical competence, but *game design taste*. Hardware acceleration is used where appropriate, but is intentionally not foregrounded; the primary constraint is clarity of design thinking and the ability to teach ideas through play.

Early exploration considered several GPU-heavy concepts, but we deliberately shifted focus toward **design principles** rather than spectacle. The guiding idea that emerged was:

> **The map is the UI.**

This principle rejects traditional HUDs, meters, and overlays. Instead, all actionable information must be spatially embedded, readable at a glance, and governed by the same rules as gameplay. From there, we narrowed the scope further by prioritizing restraint, legibility, and teachability.

Key decisions made along the way:
- The game should run entirely in the browser, client-side.
- It should be short-session, restartable, and immediately readable.
- Difficulty should emerge from interaction, not surprise.
- There should be no “cleanup phase” where tension disappears.
- The tone should be **meditative** rather than tense or frantic.
- The player should have **one core verb**, not a menu of abilities.

After exploring multiple options for spatial structure, we locked onto **organic contours** as the spatial shape most compatible with a meditative experience and long-term suspense.

What follows is the resulting specification.

---

## High-Level Design Summary

**Working Title:** Reach  
**Platform:** Browser (client-side only)  
**Tone:** Meditative  
**Session Length:** 1–4 minutes  
**Win Condition:** Survive a fixed duration  
**Failure Mode:** Gradual, systemic collapse  
**Core Principle:** The map is the UI  

The game is about managing *how far understanding extends*, not controlling units or resources.

---

## Core Player Verb

The player can only do one thing:

> **Expand or retract their spatial presence.**

Presence is continuous and soft-edged. Expanding reveals more of the world but increases instability; retracting restores clarity but sacrifices knowledge.

There are:
- No buttons
- No modes
- No object selection
- No direct interaction with entities

All decisions are expressed through space.

---

## Spatial Shape: Organic Contours (Locked)

The world is a continuous 2D plane shaped by organic, irregular contours resembling topographic features.

### Characteristics
- No grid
- No discrete tiles
- No sharp boundaries
- Irregular folds, ridges, and basins

### Rationale
Organic contours:
- Encourage reading shape rather than coverage
- Prevent complete mastery or full stabilization
- Feel natural, calm, and slightly mysterious
- Avoid obvious optimal paths

---

## World Fields (Implicit Systems)

The game world is governed by several continuous scalar fields. These are never named or shown explicitly, but are always visible through visual encoding.

### Clarity
- Highest near the center of player presence
- Decays with distance and time
- Governs visual sharpness and certainty

### Risk
- Pools in concave regions (basins)
- Exhibits subtle, high-frequency motion
- Intensifies with overextension

### Opportunity
- Appears along ridges and gentle slopes
- Expressed as smooth gradients and slow flow
- Drifts gradually over time

### Uncertainty
- Expressed via blur, noise, and loss of edge definition
- Lingers in folds and neglected regions
- Increases globally as stability decreases

All fields evolve continuously and influence one another.

---

## Player Presence

### Shape
- Soft, organic boundary
- No hard edge
- Gradual falloff of clarity toward the perimeter

### Expansion
- Smooth and continuous
- Increases visible area
- Reduces global stability

### Retraction
- Slightly faster than expansion
- Restores local clarity
- Always allowed (no lockouts)

The player is never punished for retracting; restraint is encouraged.

---

## Overextension and Failure

### Overextension
Occurs when the player’s presence grows beyond what the system can sustain. The sustainable threshold slowly decreases over time, ensuring tension never fully disappears.

### Failure Symptoms (Gradual)
1. Global clarity degradation
2. Increased motion and instability in risk regions
3. Loss of contour definition
4. Blurring of boundaries and signals

### Failure State
Failure is reached when the map becomes unreadable and meaningful decisions are no longer possible.

There are:
- No alerts
- No explosions
- No abrupt transitions

Failure should feel inevitable and understandable in retrospect.

---

## Win Condition

### Default
Survive **180 seconds**.

### Presentation
- No timer UI
- Progress is implied through subtle environmental rhythm changes
- Completion is quiet and affirming

This avoids victory laps and post-tension cleanup.

---

## Visual Tone

- Muted, low-saturation palette
- Warm/cool contrast for risk vs opportunity
- Continuous motion (drift, pulse, breathe)
- No flashing, blinking, or sharp cuts
- Fixed camera, no zoom, no shake

Visual clarity always serves comprehension over spectacle.

---

## Audio (Optional)

- Ambient, generative soundscape
- No danger stingers or alerts
- Texture subtly reflects system stability
- Silence is acceptable

---

## Input

- Mouse or touch drag
  - Outward drag: expand presence
  - Inward drag: retract presence

One interaction metaphor, no alternatives.

---

## Technical Notes (Non-Prescriptive)

- WebGL or WebGPU
- Fields represented as textures
- Deterministic simulation step
- GPU acceleration used for smoothness and continuity, not visual excess

---

## Design Intent and Taste Signals

This design intentionally demonstrates:
- Spatialized information as UI
- Constraints creating expression
- Failure as information
- Difficulty emerging from systems
- Respect for player cognition and attention

The game is meant to be *understood*, not conquered.

---

## Recommendations (Next Steps)

1. Implement the minimal loop first:
   - Presence
   - Organic field generation
   - Gradual collapse
2. Tune readability before tuning difficulty.
3. Treat visual clarity as a mechanical constraint.
4. Keep the system small; resist adding verbs.
5. Document what the game refuses to do.

If extended later, variation should come from:
- Field behavior
- Temporal rhythms
- Slight shifts in spatial structure

Not from new mechanics.

