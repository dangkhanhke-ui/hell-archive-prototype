# ATWG Asset Guide · Playable Case 01

The prototype is a browser game with local assets, **not** a gallery where every image is loaded at startup. Upload images/audio to the paths below. Keep exact filenames for the room and the 30 Ledger IDs. All paths are relative to `index.html`; no external CDN is required.

## P0: assets already wired and replaceable

| Asset | Upload path | Suggested export | Budget | Current state |
|---|---|---|---:|---|
| Main room hub (same image composition) | `assets/room/main.webp` | 1672×941 or same ratio, WebP | ≤ 600 KB | Existing author-supplied room photo |
| 30 ID portraits | `assets/portraits/01.webp` … `30.webp` | 192×256 or 384×512, WebP | ≤ 20 KB each, ≤ 600 KB combined | All 30 extracted from author montage |
| IBM photographic cabinet | `assets/ui/ibm-shell.webp` | 1672×941, WebP | ≤ 200 KB | Author-supplied IBM 2260 close-up, live CRT HTML overlaid |
| IBM bezel fallback | `assets/ui/terminal-bezel.svg` | SVG, viewBox consistent with 1440:940 | ≤ 60 KB | Fallback for smaller screens and missing imagery |
| Photographic dossier tabletop | `assets/props/tabletop.webp` | 1672×941, WebP | ≤ 240 KB | Author-supplied metal tabletop, interaction geometry unchanged |

For portraits, **01 must remain person #01**, through **30 = person #30**. Do not rename an ID to make a portrait fit. Portraits are loaded when the player first opens Ledger, not during room startup.

## P1: authored 1965 physical desk props (optional)

The desk already plays with SVG fallback art. To replace it, upload one file and set its path in `src/core/manifest.js` under `props`:

| Manifest key | Suggested new file | Size | Notes |
|---|---|---:|---|
| `folder` | `assets/props/folder.webp` | 308×386, ≤ 100 KB | Straight-on open dossier folder, transparent |
| `clip` | `assets/props/clip.webp` | 160×120, ≤ 35 KB | Metal binder clip / wire clip, transparent |
| `nameplate` | `assets/props/nameplate.webp` | 356×124, ≤ 55 KB | Blank label, player name is overlaid in code |

A WebP with alpha or a cleaned SVG is preferred. **The gameplay hitboxes remain 308×386, 78×60 and 178×62 in tabletop coordinates**; changing the art does not change drag behavior or evidence ordering. No need to make 3D assets.

The tabletop image **is now wired** and loads when Desk is opened, with old SVG as fallback. Its top-right physical drawer functions as the intake tray; the lower-right pictured wastebasket marks the trash zone. The other keys `divider`, `tray`, and `trash` remain reserved for a later visual pass; their custom image replacement is not wired yet. The current SVG tray, bin, divider and tabletop continue to work.

## P1: Wirephoto / historical images

Existing reference photos are still intentionally marked prototype drawings. Upload a **separately documented historical image** only for an actual indexed Wirephoto code already in the game. Suggested format: 1200×620 WebP or JPEG, ≤ 180 KB each. Place it under `assets/wirephoto/`, then map the **exact photo ID** to the file path under `wirephoto` in `src/core/manifest.js`.

Each photo needs grounded provenance (photographer/source, date, originating archive, printed photo code). **Do not create supernatural surveillance photos of a private murder order.** No full-scene magic view.

## P2: sound effects (optional)

Keep each file short, mono where appropriate, compressed as OGG or WebM/Opus, ≤ 90 KB per sample. Place under `assets/audio/` and set the corresponding key under `audio` in the manifest:

- `key`: IBM keyboard, 30–80 ms
- `click`: metal switch, 40–130 ms
- `search`: archive seek/confirmation, 100–300 ms
- `open`: document retrieve, 70–220 ms
- `print`: short rattling printer motor/paper feed, 500–900 ms
- `fax`: wirephoto line/modem, 200–800 ms
- `error`: dry negative buzz, 150–300 ms

Until a sample is supplied, the **existing Web Audio synthesizer remains active**. Browsers start audio only following user interaction, and the current mute setting still persists. Filenames can vary here if the manifest path is updated. Avoid long ambient music loops during the first optimization pass.

## How to upload

1. Open GitHub repo → **Add file** → **Upload files**. Put the file at the exact path above. To replace an existing photo, upload with the **same filename**, then commit.
2. If supplying a new prop, Wirephoto or sound that is currently `null` or absent from the manifest, add only the local path in `src/core/manifest.js`. Example: `folder:"assets/props/folder.webp"`. Don't edit `src/game/desk.js`.
3. Run `npm run assets:check` (no packages to install), then `npm test`.
4. Reload with Ctrl+Shift+R. Source cache tokens will be updated during release if needed.

## Budgets, loading and failure handling

- Aim for ≤ 600 KB for the **first room view** (room image + fonts/UI/code excluding the other stations' images).
- Target ≤ 2 MB for the **entire Case 01 playable media set** before sound and large optional archival images. Treat budgets as guidelines, not silent compression.
- Never embed multi-megabyte base64 art inside JS or localStorage.
- Ledger images request only when Ledger opens; desk prop assets are requested only for items on the Desk; audio samples are created only on action.
- Wrong/missing optional prop art falls back to an SVG. The desk tabletop also keeps its old SVG until the photo loads. Missing optional Wirephoto art retains the working illustration. Required room and portraits are checked by the asset script.
- CSS and JS implement gameplay. Art only decorates physical props and must **not** be used to reveal clues, roles, circles or hidden evidence.
