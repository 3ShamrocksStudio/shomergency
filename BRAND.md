# SH✡MER — Brand palette (LOCKED)

Extracted from the real SH✡MER badge (`SHOMER_logo_big.png`) and the 3Shamrocks Design
System. These are the **canonical** values. They live in `shomer.html` `:root` as CSS
custom properties and must be applied cohesively on every screen. Do not introduce
off-palette colours.

## Logo — use as-is
- File: `SHOMER_logo_big.png` (metallic sheriff-star badge; gold **Star of David** as the "O").
- Background image: `SHOMER-bg.jpg` (textured navy hero ground).
- **Never regenerate, redraw, recolour, or replace the logo.** Studio mark: `3shamrocks.png`.

## Core palette

### Navy — depth / base
| Token | Hex | Use |
|-------|-----|-----|
| `--n0` | `#060F1E` | deepest ground, theme-color base |
| `--n1` | `#0A1628` | app background, manifest `background_color`/`theme_color` |
| `--n2` | `#101E34` | panels, popups |
| `--n3` | `#162440` | raised surfaces |
| `--n4` | `#1C2C4E` | inputs, controls |
| `--n5` | `#243460` | hover / selected |
| `--n6` | `#2E4070` | strongest navy chrome |

### Gold — brand authority (the badge's gold Star of David)
| Token | Hex | Use |
|-------|-----|-----|
| `--g1` | `#9A6C1A` | deep gold |
| `--g2` | `#C09020` | gold base, CTA gradient start |
| `--g3` | `#E0A828` | primary gold accent, links, headings sheen |
| `--g4` | `#F5C840` | gold highlight, CTA gradient end |

Gold gradient (CTA / title): `linear-gradient(135deg,#C09020 0%,#E0A828 60%,#F5C840 100%)`.

### Platinum / brushed silver — the badge's engraved metal
| Token | Hex | Use |
|-------|-----|-----|
| `--p1` | `#5C6B82` | hairlines |
| `--p2` | `#8392AB` | secondary chrome |
| `--p3` | `#B6C2D6` | wordmark sheen |
| `--p4` | `#E6ECF6` | brightest metal highlight |

### Emergency red — SOS only
| Token | Hex | Use |
|-------|-----|-----|
| `--r1` | `#8A0E1A` | deep |
| `--r2` | `#B01220` | base |
| `--r3` | `#CC1426` | active |
| `--r4` | `#E8182C` | live SOS pulse / highlight |

### Status / categories
| Token | Hex | Meaning |
|-------|-----|---------|
| `--grn` | `#0E8840` | safe / responding |
| `--amb` | `#C07808` | warning / paused |
| `--blu` | `#1852C0` | live "me" location dot |
| `--pur` | `#6B32D8` | secondary category |

### Text
`--tx0 #F0F4FF` · `--tx1 #C8D4E8` · `--tx2 #8898B8` · `--tx3 #506080` · `--tx4 #344060`

## Typography
- UI: `'Inter','Heebo',system-ui,sans-serif` (`--font-main`)
- Hebrew: `'Heebo','Inter',system-ui,sans-serif` (`--font-heb`)

## Radius / elevation
Radii: 4 / 8 / 12 / 16 / 24 px (`--r4px … --r24`). Elevation: `--e1 … --e4` (soft, dark,
high-contrast shadows). Header `--hdr:52px`, bottom nav `--nav:94px`.

## Rules
1. Navy is the base; gold is for authority/accents only; red is reserved for SOS/emergency.
2. Every screen uses these tokens — no hard-coded off-palette hex.
3. Logo and studio mark are immutable assets.
