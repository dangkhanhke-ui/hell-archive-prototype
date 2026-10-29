# All Thirty Were Guilty · Case 01 gameplay prototype v0.2

An offline browser prototype of the **research → evidence → judgment** loop. The first screen is a focused search prompt inside a CRT cabinet, without a keyboard. Open `index.html` in a recent desktop browser. No installation, server, external dependency, or tracking is required. Progress is stored in browser `localStorage`; use **Xóa tiến độ bản thử** on the desk to start over.

## What to try

1. In the existing CRT, use **one shared IBM index**. Accepted syntax: `A`, `A_YYYY`, `A_B`, `A_B_YYYY`. Try `Serrano`, `Serrano_1962`, `Ledesma_Tomás Aguirre`, or `Chiến dịch San Aurelio`. The underscore separates headings and an optional filing year. No natural-language parsing.
2. **Người / Sự việc / Ấn phẩm** are three browsing paths through the same index. The source filter (all, government, press) is optional. Search results show **filing folders** first; open one to read its actual documents.
3. **THAM CHIẾU GHI TRÊN GIẤY** opens the cited folder, never preselects the most incriminating record. A cited photo code pre-fills the separate Wirephoto 000 form, but the player must still request the photo.
4. **TRA NHANH TÊN ĐƯỢC GHI** looks up an actually printed name without retyping. **ĐÃ XEM** and **GHIM TẬP** help return to records without guessing which archive folder they occupied.
5. Print the Case 01 evidence, request the Wirephoto sheets, arrange the same two four-layer dossiers (#09 and #05), and submit to the existing nine-room acceptance system.

The **CRT cabinet, terminal proportions, backdrop and non-archive gameplay are unchanged**. Case 01 evidence is still provisional, not canon; this branch modifies research UX and filing metadata, not story truth. The slice covers two suspects only, not all seven cases.

## Design constraints being tested

- Government and press documents keep distinct source provenance within **one unified filing index**. Personal/criminal papers appear only when attached to complaints or official investigations.
- Search only uses visible filing metadata (title, record ID, origin, index terms and filing year), never full text. Two-heading searches intersect metadata on each record; no graph of inferred connections.
- A record may give a photo reference, but it does not issue the photo or jump to related evidence. The player must use the reference at the separate Wirephoto station.
- The displayed author, date and provenance are part of the evidence. Seeing a final approval document alone is not the same as proving what kind of footage aired or what the approving person knew.
- The prototype currently makes room selection guessable by trying all nine rooms without penalty. This is an explicit design risk to observe, not a hidden success condition.

## Developer notes

The app uses plain HTML/CSS/JavaScript, so it can later be reimplemented in Godot. `data.js` holds draft indexed records; `rules.js` owns normalization, search, photo availability and dossier acceptance; `app.js` owns the interface. Run `node test-rules.cjs` for filing syntax, cross-source, reference integrity, and dossier checks.

The earlier three-document **Advance Payment** experiment exists only in repository history. The live version opens directly into the current Case 01 archive.
