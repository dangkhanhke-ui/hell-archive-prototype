# ALL THIRTY WERE GUILTY · Case 01: The Hero Factory

**Playable browser slice v0.3 · Case 01 V4.3 (WORKING design, not canon replacement).**

Open `index.html` locally in a recent browser; no build tools or external libraries. The physical CRT interface, original `terminal-bezel.svg`, paper desk, nine admission rooms and separate Wirephoto station remain. Saves use `localStorage` key `atwg-case01-v43` and **do not import obsolete v0.2 saves**.

## Play loop

1. Read the **two initial newspaper sheets** A01/A02, already on the desk. Search names, events, institutions and printed references. No internal A/B codes are necessary to play.
2. At **IBM Archive**, choose **NGƯỜI / SỰ VIỆC / ẤN PHẨM**, then **GOV or PRESS**. There is no ALL or TRA CHUNG mode, and category buttons never reveal a prefetched clue list. Publication mode automatically uses PRESS. One or two typed terms separated by `+`, with optional year, search *indexed metadata*, not the full content of unread files. Search never hides existing indexed records based on quest progression. Records display date, archive source, creator and in-world reference.
3. If a document provides an image reference, use **Wirephoto 000** to print a copy. The four current pictures are clearly labeled visual placeholders, not finished historical photo assets.
4. **Show a printed paper to any of the 30 souls.** Relevant witnesses may offer a narrowly bounded reaction and a printable posthumous transcript, distinct from historical sworn testimony. Asking cross-case souls is never mandatory for evidence discovery.
5. Print copies without a limit; stack physical sheets at the **Dossier Desk** by explanatory depth; submit in one of nine rooms. The validator checks multi-source arguments only on submission, without live right/wrong feedback while dragging.
6. See all **30 names, IDs and their cropped official identity portraits** in the Grand Ledger, but it does not reveal their cases, sins, jobs or verdicts.

## Current Case 01 scope

| Soul | Function | Game result |
|---|---|---|
| **#27 María Beatriz Rojas Castillejo** | Media knew early, paid Cobre and directed murder to manufacture news | **VIII / 3 layers**; needs A08/A09/A10/A11 plus production context, not only early footage |
| **#14 José Ricardo Ponce Gaitán** | Personally smashed La Linterna after caricature, not a common cover-up order | **V / 2 layers**; can be finished early |
| **#05 José Tomás Ledesma Quiroga** | Betrayed a personally promised protected witness by selling updated directions | **IX / 3 layers**; requires independent handoff/benefit and proof of reliance |
| **#07 José Camilo Varela Bustamante** | Hired Rafael for Samuel, a serious but non-final crime | **Case 01 incomplete**: neither VII nor IX is admitted on Samuel evidence alone; final IX belongs to Case 06 |

Case 01 has **24 primary evidence groups A01–A24**, **8 discovery bridges B**, two archival supplements (A21-P restricted attendance and A22-L filed private letter), an extra press-photo catalogue item, **4 referenced Wirephoto images**, and **30 official personnel catalogue entries**. Public papers and files are distinguished by provenance; private letters only become searchable via an authentically filed copy. The **Cobre/Viedma**, **Olmedo/Rafael** and **Aguirre address leak** investigations have distinct dockets.

## Design decisions and outstanding risks

- **T1 privacy is a PROTOTYPE PROPOSAL, not newly locked canon**: A01 and public A21 do not name/identify Tomás; a separately lodged, restricted civic honor appendix records his name and points to the original signed protection agreement. Author must approve appendix custodian/filing story.
- Names **Funes, Viedma, Cobre Films Servicios** and incident/photograph codes are working labels. Samuel's detailed personal past, dates, witness depositions, and exact dossier cross-layer equivalence require paper/blind playtests.
- Current validation accepts documents with multiple causal roles across adjacent layers: A20 for Ponce; A23 for Ledesma; A08/A09/A10 for Rojas, and reordered support within layers. It deliberately does **not** accept a lone witness accusation or a payment by itself.
- Each record body and encounter is a **Vietnamese in-world working script** for prototype testing. Most non-Case01 souls have no special response yet, instead of randomly offering unrelated Case02–07 secrets. The Ledger now uses the supplied numbered 30-face montage, cropped into three compressed WebP rows (source-of-truth ID order); Wirephoto crime images remain separate prototype placeholders.
- **No explorable historical tableaux, no CAPTURE/panorama, no future-document omniscience, no magical photos.** The 1965 explosion's cause remains unexplained. No asset IDs or correct circle are revealed by search results.
- The old v0.2 Serrano reconstruction-footage plot, four-layer #09 dossier, Tomás death, and N-17 papers were removed from live data because they contradict Character V4 / Case Bible V5 / Gameplay V8 / Case 01 V4.3.
- The old UI had a **brute-force room guessing** risk because jurisdiction feedback is informative. This behavior still exists and needs blind testing, not a false claim of a solved onboarding problem.

## Implementation

- `data.js`: searchable in-world evidence records, archival provenance, indexes, authorship, refs, photos, complete 30-name roster, selected document exchange topics.
- `rules.js`: input parsing, metadata-only search, strict image code check (a referenced paper must have been read), multi-layer dossier admission, available reactions.
- `app.js`: IBM archive, print copies, Wirephoto, soul exchange, dossier stacking, admission, ledger and isolated saved progress. IBM uses local Web Audio synthesizer ticks for typing, search, errors, opening and printing, with a persisted **ÂM THANH: BẬT/TẮT** toggle; it is silent if disabled or unsupported.
- `portraits.js`: three WebP sprite rows cropped from the supplied 10×3 ID photo sheet, embedded locally without remote URLs.\n- `index.html` / `styles.css`: CRT and physical paper styling, additional entry/exchange/ledger screens.
- `test-rules.cjs`: tests for discovery paths, indexing fairness, provenance, photo availability and proof validation.

Run: `node test-rules.cjs`.

**Source precedence:** direct author decisions > Case Bible V5 > Character V4 > Gameplay V8 > Puzzle Design > Relationship Bible V3 > Case 01 Puzzle V4.3 > prototype-specific production details.

## IBM search precision & audio (October 31, 2026)

IBM requires a meaningful indexed word or phrase of at least three characters. A single letter, a year alone, and incomplete fragments cannot dump large portions of the catalogue. Queries match complete normalized words or consecutive phrases against filing metadata plus specifically authored filing aliases. Printed cross-references are indexed as explicit aliases, not fuzzy token matches; government/press provenance remains separate. The mechanical Web Audio tones use **3× their earlier gain** and an audible minimum click duration. Existing mute state is preserved.


## Trash bin and printer noise

Gameplay Bible V8 §1.11: the desk has reference papers, dossier layers and **recoverable trash**. BỎ VÀO THÙNG or dropping onto the bin moves one specific physical printed copy (its stable `uid`) to `location:{zone:"trash"}`. LẤY RA BÀN restores that copy to loose reference papers. Trashed copies are excluded from soul exchanges and dossiers, but documents remain printable from source, and other physical copies are unchanged. All locations persist in the existing localStorage save.

Printing a document, a posthumous transcript, or a Wirephoto triggers a short (~0.74 s) locally synthesized paper-feed/roller rasp rather than the old three-note print tone. It obeys the IBM's mute control.


## Spatial Dossier Desk prototype v1

The Dossier Desk is now a **free-placement 2D tabletop scene** with an SVG-rendered period wood surface. Each paper copy is a readable physical white sheet with a large headline, smaller excerpt and full click-to-inspect view. Mouse/touch dragging uses Pointer Events with capture (no browser drag ghost); positions, angle and z-order persist. Clicking a paper brings it forward visually **without changing its causal evidence depth**.

The corner supply provides unlimited folder props, metal clips and nameplates, all freely movable. A selected folder accepts paper via the sheet's contextual **ĐƯA VÀO BÌA ĐANG CHỌN** action. Its ordered stack runs from outside/observed at the bottom to deeper explanation on top. Use **ĐƯA LÊN / XUỐNG 1 TỜ** and a physical **CHÈN NGĂN** divider to group same-function evidence into inferential layers; arbitrary paper order inside a layer is not a puzzle. Folder dragging moves the contained sheets; loose objects may overlap anywhere. Dragging a loose paper out of an unfastened folder removes exactly that copy.

Select one of 30 identities on a movable nameplate and place it on a folder. A clip dropped on a folder seals it; a sealed, named folder exposes **→ TIẾP NHẬN** and lets the user choose a room. Failed submission never consumes or reorganizes papers. Reopen a clip to revise. Saved old Desk layers are migrated to spatial folders (without changing original paper UIDs) and the recoverable paper bin still functions. This is a 2D UI, not a 3D rigid-body simulation; no claim of native-engine motion tuning.
