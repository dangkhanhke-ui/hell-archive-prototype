# Architecture · Case 01 prototype

This is a **no-build, static, local-first** browser prototype. The folder layout is deliberate:

```
index.html
src/
  core/
    manifest.js      # File-path registry only
    assets.js        # Validate local file paths, resolve image/audio slots
    save.js          # Stable legacy key atwg-case01-v43, graceful invalid-save fallback
    audio.js         # Lazy Web Audio/samples with synthesized fallback
    data.js          # In-world records, photo codes, names, conversations
    rules.js         # Search, jurisdiction, dossier evaluation
  game/
    room.js          # Room hotspot events + returning to room
    desk.js          # Pointer Events spatial tabletop and physical dossier
    app.js           # Game state, IBM, souls, wirephoto, ledger, admission
  styles/
    global.css
    desk.css
    room.css
assets/
  room/main.webp
  portraits/01.webp ... 30.webp
  ui/terminal-bezel.svg
  props/.gitkeep
  audio/.gitkeep
  wirephoto/.gitkeep
tests/
  test-rules.cjs
  test-spatial-desk.cjs
  test-room.cjs
scripts/check-assets.cjs
docs/ASSETS.md
```

Script order in `index.html` is explicit and uses `defer`, so local `file://` operation does not depend on module fetch/CORS. There is **no npm dependency**. The room background has a local path. CSS scales the photo with fixed aspect ratio, and its six accessible hotspots remain at percentages matching physical objects.

### Persistence contract

The save key remains `atwg-case01-v43`, with `serial`, `readIds`, `history`, `pins`, `papers`, `transcripts`, `admitted`, and `scene`. Old saves are loaded, not reset. Printed copies have distinct `uid`; the Desk saves every paper's coordinates, folder membership and order and supports its recoverable bin. External binary image/audio data **must never be serialized into a save**.

### Loading policy

Initial game loads are room photo + HTML/CSS + small JS and rules/data. The 30 face images were previously 69 KB of inline base64 JS, now 30 independently cacheable local WebPs (about 145 KB combined), created only when Ledger is first entered. Desk props are optional and fall back to built-in SVG; optional Wirephoto photos fall back to a plainly labeled working illustration. Audio is a user-gesture-driven service; source samples do not preload at boot.

Never indiscriminately preload all archive photos, all 30 Ledger portraits, all nine room textures or a soundtrack. Always keep gameplay functional if optional artwork fails.

### Responsibility boundaries

- **Case evidence truth** lives in `src/core/data.js` and `src/core/rules.js`, not image filenames.
- **Appearance and file paths** live in `src/core/manifest.js`; no per-file URIs should be hard-coded into game rules.
- **Movement, layers, clip, nameplate, intake tray** live in `src/game/desk.js`.
- **Progress, state, scene navigation and stations** live in `src/game/app.js`, with the room event binder in `src/game/room.js`.
- Updating portrait art must never change who a soul is; adding a photograph must never make an unindexed private document searchable.

### Testing

Run `npm test`: room navigation, photo/asset manifest validation, dossier semantics, Save V4.3 migration, IBM exact indexing, sound integration, desk pointer movements and clip → tray → admission. `npm run assets:check` audits names/paths/dimensions-budget files. The checks are not a substitute for visual/browser testing of CSS responsiveness or tactile drag performance.
