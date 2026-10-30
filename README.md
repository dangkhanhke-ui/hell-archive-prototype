# ALL THIRTY WERE GUILTY · Case 01: The Hero Factory

**Playable browser slice v0.3 · Case 01 V4.3 (WORKING design, not canon replacement).**

Open `index.html` locally in a recent browser; no build tools or external libraries. The physical CRT interface, original `terminal-bezel.svg`, paper desk, nine admission rooms and separate Wirephoto station remain. Saves use `localStorage` key `atwg-case01-v43` and **do not import obsolete v0.2 saves**.

## Play loop

1. Read the **two initial newspaper sheets** A01/A02, already on the desk. Search names, events, institutions and printed references. No internal A/B codes are necessary to play.
2. At **IBM Archive**, choose GOV, PRESS or ALL. One or two terms separated by `+`, with optional year, search *indexed metadata*, not the full content of unread files. Search never hides existing indexed records based on quest progression. Records display date, archive source, creator and in-world reference.
3. If a document provides an image reference, use **Wirephoto 000** to print a copy. The four current pictures are clearly labeled visual placeholders, not finished historical photo assets.
4. **Show a printed paper to any of the 30 souls.** Relevant witnesses may offer a narrowly bounded reaction and a printable posthumous transcript, distinct from historical sworn testimony. Asking cross-case souls is never mandatory for evidence discovery.
5. Print copies without a limit; stack physical sheets at the **Dossier Desk** by explanatory depth; submit in one of nine rooms. The validator checks multi-source arguments only on submission, without live right/wrong feedback while dragging.
6. See all **30 names and IDs** in the Grand Ledger, but it does not reveal their cases, sins, jobs or verdicts.

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
- Each record body and encounter is a **Vietnamese in-world working script** for prototype testing. Most non-Case01 souls have no special response yet, instead of randomly offering unrelated Case02–07 secrets. Ledger portrait marks are placeholders, not fixed ID/Face portraits.
- **No explorable historical tableaux, no CAPTURE/panorama, no future-document omniscience, no magical photos.** The 1965 explosion's cause remains unexplained. No asset IDs or correct circle are revealed by search results.
- The old v0.2 Serrano reconstruction-footage plot, four-layer #09 dossier, Tomás death, and N-17 papers were removed from live data because they contradict Character V4 / Case Bible V5 / Gameplay V8 / Case 01 V4.3.
- The old UI had a **brute-force room guessing** risk because jurisdiction feedback is informative. This behavior still exists and needs blind testing, not a false claim of a solved onboarding problem.

## Implementation

- `data.js`: searchable in-world evidence records, archival provenance, indexes, authorship, refs, photos, complete 30-name roster, selected document exchange topics.
- `rules.js`: input parsing, metadata-only search, strict image code check (a referenced paper must have been read), multi-layer dossier admission, available reactions.
- `app.js`: IBM archive, print copies, Wirephoto, soul exchange, dossier stacking, admission, ledger and isolated saved progress.
- `index.html` / `styles.css`: CRT and physical paper styling, additional entry/exchange/ledger screens.
- `test-rules.cjs`: tests for discovery paths, indexing fairness, provenance, photo availability and proof validation.

Run: `node test-rules.cjs`.

**Source precedence:** direct author decisions > Case Bible V5 > Character V4 > Gameplay V8 > Puzzle Design > Relationship Bible V3 > Case 01 Puzzle V4.3 > prototype-specific production details.
