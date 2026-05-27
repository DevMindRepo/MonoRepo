# DevMind Icon Generation Prompts

Prompt untuk semua custom illustration asset di `/public/`. Setiap asset wajib **tidak ada background** (pure PNG transparency) — supaya bisa diletakkan di card glass / hero apapun tanpa edge yang aneh.

Dua kategori visual:
- **Brand icons (ASSET 1–6):** isometric 3D crystalline / wireframe — vibe Linear / Vercel marketing — dipakai untuk identitas brand di metric card, hero, section header.
- **Empty states (ASSET 7–9):** flat 2D line art minimal — vibe Notion / Linear empty-state illustration — dipakai di tengah halaman kosong.

Output langsung ke `frontend/public/` dengan nama file sesuai.

---

## ASSET 1 — memory-network.png

Dipakai di: /dashboard metric card "Total Memories" (render ~40–56px), juga bisa dipakai sebagai hero accent
Dimensi: 512 × 512 px, PNG transparan

Generate a custom brand illustration for "Memory Network" (512x512px, transparent background PNG).
This represents DevMind's neural-style memory graph — the core product metaphor.

SUBJECT:
An isometric 3D wireframe of three glowing crystalline memory nodes connected by thin neon-lime lines.
Key characteristics:
- 3 polyhedral nodes (octahedron or low-poly sphere) arranged in a triangle layout —
  one node at the top-center, two nodes at the bottom-left and bottom-right
- Each node ~110–130px across, drawn as wireframe (edges visible, hollow interior)
- Edges of each node: neon lime-green (#ADFF2F) at 90% opacity
- Each node has a faint inner glow at its core (a smaller solid lime dot at 60% opacity, ~12px)
- Thin lime connection lines link the three nodes (edge-to-edge, not center-to-center),
  ~1.5px width, 70% opacity
- Around each node: 3–4 tiny particle dots floating (white at 40%), suggesting energy/data
- Slight isometric tilt — viewed from upper-front, so depth is implied but the layout
  still reads clearly

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Isometric 3D wireframe — crystalline / low-poly aesthetic
- Maximum 2 colors: neon lime-green (#ADFF2F) + faint white particles
- Hairline strokes (1.5–2px), no fills (only the tiny core dots are filled)
- Subtle ambient particle glow only — no heavy bloom, no lens flare, no gradients
- Linear app / Vercel marketing aesthetic — crisp, technical, premium
- Overall composition within the 512px canvas: ~440px centered, with breathing room
- NO text, NO labels, NO decorative border

---

## ASSET 2 — walrus-blob.png

Dipakai di: /dashboard metric card "Walrus Storage" (render ~40–56px), landing page architecture section
Dimensi: 512 × 512 px, PNG transparan

Generate a custom brand illustration for "Walrus Storage" (512x512px, transparent background PNG).
This represents decentralized blob storage on the Walrus protocol.

SUBJECT:
A floating translucent crystalline cube with layered data shards visible inside.
Key characteristics:
- Outer cube: hollow wireframe in isometric perspective, ~360px wide,
  drawn with thin hairline edges in white at 40% opacity
- Inside the cube: 3 parallel horizontal shard-planes stacked vertically, each plane
  is a flat rectangle ~280×30px tilted to match isometric perspective
- Top shard: lime-green tinted (#ADFF2F at 70%) — the "active" data layer
- Middle shard: white at 50%
- Bottom shard: faint white at 25%
- A small glowing lime core dot in the geometric center of the cube (~16px), suggesting
  the data nucleus
- Faint blue ambient particles (#60A5FA at 25%) — 5–6 small dots floating around the
  exterior, suggesting the decentralized network
- Cube edges where shards meet: highlight with brighter lime where the top shard
  intersects the cube wall

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Isometric 3D translucent / crystalline cube aesthetic
- Maximum 3 colors: lime-green (#ADFF2F) + electric blue (#60A5FA) + white-gray
- Hairline strokes (1.5–2px) for the cube edges, slightly thicker (2.5px) on the
  lime top shard for emphasis
- No heavy shadows, no gradients inside the shards (use flat opacity differences instead)
- Sharp geometric edges — clean, premium feel
- Linear / Vercel illustration aesthetic
- Overall composition within the 512px canvas: ~440px centered
- NO text, NO labels, NO decorative border

---

## ASSET 3 — mcp-connect.png

Dipakai di: /connect page header banner, landing page how-it-works section, marketing hero secondary
Dimensi: 512 × 512 px, PNG transparan

Generate a custom brand illustration for "MCP Connection" (512x512px, transparent background PNG).
This represents the bridge between an AI tool (Claude/Cursor) and DevMind's memory layer.

SUBJECT:
Two geometric orbs of slightly different style, connected by a horizontal luminous beam.
Key characteristics:
- LEFT orb: ~120px diameter circle drawn as wireframe, with a circuit-board pattern
  visible inside (3–4 thin straight horizontal lines + 2 vertical lines + 4 tiny dots
  at intersection points) — represents the AI tool
- RIGHT orb: ~120px diameter circle, with a memory-grid pattern inside (a 3×3 dot
  matrix with thin connecting lines between adjacent dots) — represents DevMind memory
- Both orbs share a horizontal centerline at the canvas's vertical middle
- Connecting beam: a horizontal stretched rectangle/lozenge between the two orbs,
  ~180px long, ~14px tall at center, tapering to ~6px at both ends — drawn with thin
  outline + a slightly thicker lime core line down its center
- 3–4 tiny particle dots floating along the beam, suggesting data flowing left-to-right
- Left orb edges: electric blue (#60A5FA at 80%)
- Right orb edges: lime-green (#ADFF2F at 80%)
- Beam core line: bright lime (#ADFF2F at 90%)
- Beam outer outline: faint white (40%)

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Crystalline minimal 3D — both orbs slightly tilted toward viewer to imply depth
- Maximum 3 colors: lime-green (#ADFF2F) + electric blue (#60A5FA) + white-gray
- Hairline strokes (1.5–2px)
- No bloom, no lens flare, no gradients — just hairline outlines + opacity layering
- Linear app aesthetic — technical, premium
- Overall composition within the 512px canvas: ~480px wide centered horizontally
- NO text, NO labels, NO decorative border

---

## ASSET 4 — agent-bot.png

Dipakai di: /dashboard metric card "Agent Runs" (~40–56px), /agent-timeline page header banner
Dimensi: 512 × 512 px, PNG transparan

Generate a custom brand mascot for "Agent Bot" (512x512px, transparent background PNG).
This represents the PR Reviewer Agent and the broader autonomous-agent ecosystem.

SUBJECT:
A minimal geometric robot head with a single antenna — friendly but technical.
Key characteristics:
- Head: hexagonal silhouette ~280px wide and ~260px tall, drawn as wireframe outline
- Inside the head: two small horizontal "eye" shapes — each is a short horizontal
  pill ~50px wide × 14px tall, positioned in the upper third of the hexagon,
  spaced ~60px apart
- Eyes: filled with lime-green (#ADFF2F at 90%), giving the "glowing eyes" effect
- Below the eyes, a single short horizontal line (~80px) suggesting a closed mouth/visor
- Antenna: a thin vertical line ~50px tall extending from the top vertex of the hexagon,
  with a small filled circle (~16px) at its tip — the circle in cyan (#60A5FA at 80%)
- 2–3 small geometric corner-detail marks at the hexagon's bottom vertices (tiny
  triangles or dashes), suggesting "robot panel lines"
- Head outline: white at 60%, hairline strokes
- Slight isometric 3/4 view tilt — head turned ~15 degrees toward the viewer's left,
  so it feels alive but still reads as a clean silhouette

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Minimal geometric / robot-mascot style — Linear / Stripe icon vibe
- Maximum 3 colors: lime-green (#ADFF2F) eyes + cyan (#60A5FA) antenna tip + white-gray outline
- Hairline strokes (1.5–2px) for the head outline; eyes and antenna tip are filled
- No facial expression, no smile/frown lines — just the geometric eye-pills
- No heavy shadows, no gradients
- Crisp and characterful — recognizable as a "bot" but abstract enough to feel premium
- Overall composition within the 512px canvas: ~380px centered
- NO text, NO labels, NO decorative border

---

## ASSET 5 — sui-anchor.png

Dipakai di: /settings page workspace identity section, /onboarding step 1, marketing trust badges
Dimensi: 512 × 512 px, PNG transparan

Generate a custom brand illustration for "Sui Anchor" (512x512px, transparent background PNG).
This represents the workspace identity being anchored to a Sui Move smart contract.

SUBJECT:
A floating rhombus/diamond crystal with internal facets and short anchor-line marks at each tip.
Key characteristics:
- Outer rhombus (diamond): a four-pointed shape ~340px tall × 240px wide,
  drawn as hairline outline in white at 55%
- Inside the rhombus: 4 internal facet lines connecting opposite midpoints,
  dividing the diamond into 4 triangular facets
- 2 of the 4 facets are lime-tinted (#ADFF2F at 30% fill) — the top-right and
  bottom-left facets, suggesting depth via opposing highlights
- The other 2 facets stay hollow (transparent)
- A small solid lime dot (~14px) sits exactly at the geometric center of the diamond
- 4 short straight anchor-line marks extend outward from each of the diamond's 4 tips
  (top, right, bottom, left) — each line ~24px long, hairline width, in white at 40%
- Slight isometric tilt — the diamond rotates ~10 degrees clockwise so it doesn't
  read as a flat 2D shape

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Crystalline minimal — geometric, sharp, premium
- Maximum 2 colors: lime-green (#ADFF2F) facet fills + white-gray outline
- Hairline edges (1.5–2px) for the diamond outline and facet lines
- Anchor marks (1.5px) — straight clean lines, not arrows
- No shadows, no gradients (the lime facet fills use flat opacity, no gradient)
- Dark/transparent backdrop — the illustration must read on any dark glass card
- Overall composition within the 512px canvas: ~400px centered (taller than wide)
- NO text, NO labels, NO decorative border

---

## ASSET 6 — seal-encryption.png

Dipakai di: /dashboard metric card "Pending Approval" (~40–56px), /approval-queue page header
Dimensi: 512 × 512 px, PNG transparan

Generate a custom brand illustration for "Seal Encryption" (512x512px, transparent background PNG).
This represents the Seal-encrypted gate before memory hits Walrus storage.

SUBJECT:
A hexagonal vault door with a glowing keyhole and delicate concentric rings inside.
Key characteristics:
- Outer hexagon: ~360px diameter (point-to-point), drawn as hairline outline in white at 60%
- Inside the hexagon, 2 concentric inner hexagons at ~280px and ~200px diameter,
  each fainter than the previous (50% then 35% opacity), drawn as hairline outlines —
  giving the "vault layer / wax-seal embossed" effect
- At the geometric center: a vertical lime keyhole — a small filled circle (~22px diameter)
  on top of a short vertical lime rectangle (~10×28px), like a classic keyhole silhouette,
  in lime-green (#ADFF2F at 90%)
- 6 short tick-marks placed at each vertex of the outer hexagon (small ~12px lines
  pointing outward radially) — hairline, white at 40%
- Slight isometric 3/4 view — the hexagon tilts ~12 degrees so the right edge appears
  closer than the left, with the concentric rings following the same tilt

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Crystalline minimal — geometric / wax-seal embossed feel
- Maximum 2 colors: lime-green (#ADFF2F) keyhole + white-gray outlines
- Hairline strokes (1.5–2px) for hexagon outlines
- The keyhole is the only filled element — everything else is outline-only
- No bloom, no glow filter, no gradients — the "glow" of the keyhole is just bright
  opaque fill, nothing more
- Premium technical aesthetic — Linear / Vercel illustration vibe
- Overall composition within the 512px canvas: ~420px centered
- NO text, NO labels, NO decorative border

---

## ASSET 7 — empty-artifacts.png

Dipakai di: /artifacts page empty state — rendered small ~120×120px di tengah halaman
Dimensi: 240 × 240 px, PNG transparan

Generate a minimal empty state illustration (240x240px, transparent background PNG).
This represents "no artifacts yet" — empty file storage waiting for its first item.

SUBJECT:
A stack of 3 file/document cards arranged with slight rotation, with the top card
mostly empty (no content lines drawn inside).
Key characteristics:
- 3 rectangular cards (~110×140px each) stacked with each card rotated slightly
  differently: bottom card tilted -8°, middle card tilted +4°, top card straight
- Top card: completely empty interior (no text lines drawn inside) — just the
  rectangular outline with a folded-corner detail in the top-right (folded triangle)
- Middle card: 1 single short horizontal text-line drawn faintly inside
- Bottom card: 2 horizontal text-lines drawn even fainter
- All cards: white outline only, no fill
- Top card outline: white at 40% opacity
- Middle card outline: white at 25%
- Bottom card outline: white at 15%
- A tiny "+" symbol floating ~30px above the top card, lime-tinted (#ADFF2F at 50%),
  suggesting "add your first artifact"

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Flat 2D, line art style
- Maximum 2 colors: white-gray + subtle lime-green
- No shadows, no gradients within the illustration itself
- Minimal and elegant — like Notion or Linear's empty state illustrations
- Overall dimensions of the illustration within the 240px canvas: ~160px centered
- NO text, NO labels, NO decorative border

---

## ASSET 8 — empty-timeline.png

Dipakai di: /agent-timeline page empty state — rendered small ~120×120px di tengah halaman
Dimensi: 240 × 240 px, PNG transparan

Generate a minimal empty state illustration (240x240px, transparent background PNG).
This represents "no agent runs yet" — an empty timeline waiting for its first event.

SUBJECT:
A vertical timeline line with 3 evenly-spaced dot-markers along it, all in muted/unfilled state.
Key characteristics:
- A single vertical line ~140px tall, centered on the canvas, drawn dotted/dashed
  (not solid) — suggesting "nothing has happened yet"
- 3 circle-markers along the line: one near the top, one in the middle, one near the bottom
- Each marker: hollow circle ~20px diameter, white outline at 30% opacity, no fill
- The TOP marker only is lime-tinted (#ADFF2F at 50%) with a faint pulse ring around it
  (a second outer hollow circle at ~28px diameter, slightly fainter) — suggesting
  "your first agent run will appear here"
- To the right of each marker, draw 1 short horizontal placeholder-line (~50px) to
  hint at where the event label would go — at 15% opacity
- To the right of the top (lime) marker, the placeholder line is slightly longer
  (~70px) and at 25% opacity

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Flat 2D, line art style
- Maximum 2 colors: white-gray + subtle lime-green
- No shadows, no gradients within the illustration itself
- Minimal and elegant — like Notion or Linear's empty state illustrations
- Overall dimensions of the illustration within the 240px canvas: ~160px centered
- NO text, NO labels, NO decorative border

---

## ASSET 9 — empty-memories.png

Dipakai di: /memories page empty state — rendered small ~120×120px di tengah halaman
Dimensi: 240 × 240 px, PNG transparan

Generate a minimal empty state illustration (240x240px, transparent background PNG).
This represents "no memories yet" — an empty brain/knowledge base.

SUBJECT:
A brain outline/silhouette made of simple geometric connected dots and lines
(node graph style). The brain shape is recognizable but abstract.
Key characteristics:
- Constructed from ~12 small circle nodes connected by thin straight lines
- The overall shape forms a brain left-profile silhouette (~160px wide)
- Nodes: white circles with very low opacity (30-40%)
- Connecting lines: white at 20% opacity
- 3-4 nodes have a subtle lime-green tint (#ADFF2F at 25% opacity)
- The overall illustration feels "incomplete" — some nodes are missing connections,
  some lines end without a node, suggesting emptiness

STYLE:
- Transparent background (no background at all — pure PNG transparency)
- Flat 2D, line art style
- Maximum 2 colors: white-gray + subtle lime-green
- No shadows, no gradients within the illustration itself
- Minimal and elegant — like Notion or Linear's empty state illustrations
- Overall dimensions of the illustration within the 240px canvas: ~160px centered
- NO text, NO labels, NO decorative border
