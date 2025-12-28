# Implementation Decisions

## Decision Log

### 1. Implementation Priority: Core Loop First
**Question:** Should we prioritize core mechanics or aesthetic foundation?
**Decision:** Core loop first.
**Rationale:** Get presence expansion/retraction working with basic visual feedback, then layer in polish. Visual clarity as a "mechanical constraint" applies to the end product, not the development process.

### 2. Input Reference Point: Center of Presence
**Question:** What is the reference point for expand/retract drag gestures?
**Decision:** Center of presence.
**Rationale:** Player drags outward from the center of their presence region to expand, inward toward center to retract. This anchors the presence spatially and creates a clear mental model.

---

## Implementation Plan

### Phase 1: Minimal Core Loop
1. **HTML/Canvas setup** with WebGL context
2. **Presence state** — position (centered), radius, expansion rate
3. **Input handling** — track mouse/touch drag direction relative to presence center
4. **Basic presence rendering** — soft circular gradient (placeholder for organic shape)
5. **Expansion/retraction mechanics** — smooth, continuous size changes
6. **Timer** — 180 second survival (no UI, internal only for now)
7. **Basic stability system** — overextension triggers clarity decay

### Phase 2: Field Systems
- Clarity field (decays with distance and time)
- Risk field (pools in concave regions)
- Opportunity field (appears on ridges)
- Uncertainty field (blur/noise in neglected areas)

### Phase 3: Organic Contours
- Replace circular presence with organic, irregular boundaries
- Procedural terrain generation (ridges, basins, folds)

### Phase 4: Visual Polish
- Muted color palette (warm/cool contrast)
- Continuous motion (drift, pulse, breathe)
- Blur and noise for uncertainty
- Gradual failure visualization

### Phase 5: Audio (Optional)
- Ambient generative soundscape

---

## Technical Choices

| Aspect | Choice | Rationale |
|--------|--------|-----------|
| Renderer | WebGL 2 | Wide browser support, sufficient for 2D fields |
| Field storage | GPU textures | Spec recommends, enables smooth gradients |
| Simulation | Fixed timestep | Deterministic, spec requires |
| Build | Vanilla JS (no bundler) | Simplicity for browser-only game |
