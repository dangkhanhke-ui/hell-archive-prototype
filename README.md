# All Thirty Were Guilty · Case 01 gameplay prototype v0.2

An offline browser prototype of the **research → evidence → judgment** loop. Open `index.html` in a recent desktop browser. No installation, server, external dependency, or tracking is required. Progress is stored in browser `localStorage`; use **Xóa tiến độ bản thử** on the desk to start over.

## What to try

1. Read the opening brief. Search or browse the government and newspaper catalogues. Search accepts indexed names, places, events and codes without Vietnamese diacritics. Result rows show neutral titles and provenance, never a precomputed evidence trail.
2. Open records and print copies. On the broadcast route, read the film log before using its two codes at **Wirephoto 000**. Printed photos are separate sheets.
3. Build four-layer dossiers for **#09 Serrano** and **#05 Ledesma**. Move paper by dragging or with the keyboard-friendly layer selector. The game does not validate papers as they are placed.
4. Submit to one of nine rooms. The submission checks jurisdiction, then proof completeness and layer placement. Extra relevant corroboration in a valid layer is accepted.

The evidence is drawn from the current Case 01 design draft and remains **provisional**. The complete seven-case game, the other two Case 01 suspects, the 30-person roster, character conversations, all nine rooms' presentation, and production art are outside this slice. The purpose is to check whether a reader can retrieve records without tedious searching and still has to reason about source, timing, intention and personal trust.

## Design constraints being tested

- There are exactly two text catalogues: government records and independently compiled press records. Personal letters and criminal papers appear in government results only because they were attached to a complaint or seized in an investigation.
- Search is limited to a visible record's **filing index** (`terms`, title, date, origin and ID). It is not full-text or semantic search. Name-indexed documents remain discoverable by name.
- A record may give a photo reference, but it does not issue the photo or jump to related evidence. The player must use the reference at the separate Wirephoto station.
- The displayed author, date and provenance are part of the evidence. Seeing a final approval document alone is not the same as proving what kind of footage aired or what the approving person knew.
- The prototype currently makes room selection guessable by trying all nine rooms without penalty. This is an explicit design risk to observe, not a hidden success condition.

## Developer notes

The app uses plain HTML/CSS/JavaScript, so it can later be reimplemented in Godot. `data.js` holds draft indexed records; `rules.js` owns normalization, search, photo availability and dossier acceptance; `app.js` owns the interface. Run `node test-rules.cjs` for focused rule checks.

The prior three-document **Advance Payment** experiment remains in the repository's `main` history. This version replaces its multiple-choice conclusion with the current game's Case 01 dossier mechanic on a separate branch.
