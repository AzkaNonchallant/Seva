---
version: alpha
name: Navan
description: |
  Navan's design system embodies a modern, tech-forward aesthetic grounded in
  professional enterprise software. The palette combines a bold deep purple
  (#15002C) with vibrant gradient accents that feel energetic yet controlled.
  The typography employs serif display faces (Sanomat) for headlines paired with
  clean sans-serif body copy (Inter), creating visual hierarchy and
  sophistication. Whitespace is generous and deliberate, allowing complex travel
  and expense workflows to feel uncluttered. The overall mood is confident,
  trustworthy, and aspirational—designed to make corporate travel management
  feel effortless and intelligent.
source:
  url: "https://navan.com/"
  pagesAnalyzed: 1
  extractedAt: 2026-10-20
  tokensMeasured: true
colors:
  primary: "#15002C"
  accent: "#6307F8"
  canvas: "#FFFFFF"
  surface-alt: "#F1F1F9"
  on-primary: "#FFFFFF"
  ink: "#060000"
  accent-1: "#A9A9BC"
  accent-2: "#C185E5"
  accent-3: "#DA9EFF"
  accent-4: "#E1E2FE"
  accent-5: "#07072C"
  neutral-1: "#C6C6D2"
  neutral-2: "#D1D5DB"
typography:
  display-lg:
    fontFamily: Sanomat
    fontSize: 45px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0px
  display-lg-tight:
    fontFamily: Sanomat
    fontSize: 45px
    fontWeight: 600
    lineHeight: 1
    letterSpacing: -2px
  display-md:
    fontFamily: Sanomat
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0px
  heading-md:
    fontFamily: Sanomat
    fontSize: 34px
    fontWeight: 400
    lineHeight: 1.24
    letterSpacing: 0px
  heading-sm:
    fontFamily: Sanomat
    fontSize: 30px
    fontWeight: 600
    lineHeight: 2.13
    letterSpacing: 0px
  heading-xs:
    fontFamily: Inter
    fontSize: 19px
    fontWeight: 700
    lineHeight: 1.47
    letterSpacing: -2px
  body-lg:
    fontFamily: Inter
    fontSize: 19px
    fontWeight: 700
    lineHeight: 1.32
    letterSpacing: -2px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: -2px
  body-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 300
    lineHeight: 1.6
    letterSpacing: -2px
  body-sm-tight:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: -2px
  body-xs:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 300
    lineHeight: 1.31
    letterSpacing: -2px
  body-xs-strong:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.46
    letterSpacing: -2px
  nav:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.36
    letterSpacing: -2px
  button-md:
    fontFamily: Inter
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.88
    letterSpacing: -2px
  button-sm:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 300
    lineHeight: 1.33
    letterSpacing: -2px
  button-sm-tight:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 300
    lineHeight: 1.2
    letterSpacing: -2px
  button-sm-strong:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: -2px
  button-sm-loose:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: -2px
  button-xs:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -2px
  label:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 300
    lineHeight: 1.36
    letterSpacing: -2px
  caption-xs:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 300
    lineHeight: 1.58
    letterSpacing: -2px
  caption-xs-tight:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 300
    lineHeight: 1.5
    letterSpacing: -2px
  caption-xs-strong:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.58
    letterSpacing: -2px
rounded:
  none: 0px
  xs: 8px
  sm: 12px
  md: 14px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 28px
  xxxl: 32px
  section: 40px
  band: 44px
borderWidths:
  thin: 1px
  medium: 2px
shadows:
  sm: "rgba(0, 0, 0, 0.25) 0px 25px 50px -12px"
  md: "rgba(0, 0, 0, 0.13) 0px 1px 12px 0px"
  lg: "rgba(0, 0, 0, 0.18) 2.99403px 2.99403px 5.98806px 0px"
elevationStrategy: layered-micro
themes:
  derived: dark   # the other theme is the site's measured palette
  light:
    bg: "#FFFFFF"
    surface: "#F1F1F9"
    surfaceRaised: "#E8E7EF"
    text: "#060000"
    textMuted: "#5D5959"
    border: "#E1E0E0"
    accent: "#15002C"
    accentFg: "#FFFFFF"
    focusRing: "#15002C"
    elevation: shadow
  dark:
    bg: "#0F0D12"
    surface: "#1D1C20"
    surfaceRaised: "#29282C"
    text: "#F6F5F7"
    textMuted: "#9E9DA0"
    border: "#353438"
    accent: "#A14BFF"
    accentFg: "#0B0B0C"
    focusRing: "#810DFF"
    elevation: "border+surface"
gradients:
  - context: section
    kind: linear
    value: "linear-gradient(117deg, rgb(124, 81, 250), rgb(27, 0, 95), rgb(124, 81, 250))"
components:
  button-filled:
    typography: "{typography.button-sm-strong}"
    textColor: "{colors.on-primary}"
    border: "2px solid {colors.accent}"
    height: 42px
    padding: "10px 28px 10px 28px"
    rounded: "{rounded.full}"
    backgroundColor: "{colors.accent}"
  button-primary:
    typography: "{typography.button-xs}"
    textColor: "{colors.on-primary}"
    border: "2px solid {colors.primary}"
    height: 44px
    padding: "10px 28px 10px 28px"
    rounded: "{rounded.full}"
    backgroundColor: "{colors.primary}"
  button-filled-lg:
    typography: "{typography.button-xs}"
    textColor: "{colors.on-primary}"
    border: "2px solid {colors.accent}"
    height: 44px
    padding: "10px 28px 10px 28px"
    rounded: "{rounded.full}"
    backgroundColor: "{colors.accent}"
  button-outline:
    typography: "{typography.button-sm-loose}"
    textColor: "{colors.primary}"
    border: "1px solid {colors.primary}"
    height: 46px
    padding: "10px 46px 10px 46px"
    rounded: "{rounded.full}"
  button-outline-sm:
    typography: "{typography.body-xs-strong}"
    textColor: "{colors.primary}"
    border: "1px solid {colors.primary}"
    height: 41px
    padding: "10px 28px 10px 28px"
    rounded: "{rounded.full}"
  card:
    typography: "{typography.body-md}"
    textColor: "rgb(0, 0, 0)"
  card-2:
    typography: "{typography.body-md}"
    textColor: "rgb(0, 0, 0)"
    rounded: "{rounded.md}"
    backgroundColor: "{colors.canvas}"
  navigation:
    typography: "{typography.body-md}"
    textColor: "rgb(0, 0, 0)"
    height: 77px
    padding: "0px 20px 0px 20px"
  link:
    textColor: "{colors.ink}"
    padding: "8px 0px 8px 0px"
    fontSize: 17px
    fontFamily: Inter
    fontWeight: 300
    lineHeight: 1.88
  link-2:
    typography: "{typography.nav}"
    textColor: "{colors.primary}"
states:
  input-focus:
    target: input
    state: focus
    outline: "transparent solid 2px"
    outlineColor: transparent
    outlineWidth: 2px
  other-hover:
    target: other
    state: hover
    rounded: "{rounded.full}"
breakpoints:
  - width: 375
    containerWidth: 367
    gridColumns: 6
    navLinksVisible: 0
    menuToggleVisible: true
    headingPx: 28
    bodyPx: 16
    sectionPaddingX: 30
  - width: 768
    containerWidth: 760
    gridColumns: 5
    navLinksVisible: 0
    menuToggleVisible: true
    headingPx: 45
    bodyPx: 16
    sectionPaddingX: 30
  - width: 1024
    containerWidth: 884
    gridColumns: 6
    navLinksVisible: 0
    menuToggleVisible: true
    headingPx: 45
    bodyPx: 16
    sectionPaddingX: 30
  - width: 1280
    containerWidth: 1230
    gridColumns: 6
    navLinksVisible: 4
    menuToggleVisible: true
    headingPx: 45
    bodyPx: 16
    sectionPaddingX: 0
  - width: 1440
    containerWidth: 1320
    gridColumns: 6
    navLinksVisible: 4
    menuToggleVisible: true
    headingPx: 45
    bodyPx: 16
    sectionPaddingX: 0
coverage:
  statesFound: 61
  gradientsFound: 1
  rolesUnassigned: 7
  archetypesUnnamed: 0
  archetypesDetected: 0
  responsiveMeasured: true
  stylesheetsBlocked: false
  semanticRampDeclared: false
---

# Design System Inspired by Navan

## 1. Visual Theme & Atmosphere

Navan's design system embodies a modern, tech-forward aesthetic grounded in professional enterprise software. The palette combines a bold deep purple (`{colors.primary}` — `#15002C`) with vibrant gradient accents that feel energetic yet controlled. The typography employs serif display faces (Sanomat) for headlines paired with clean sans-serif body copy (Inter), creating visual hierarchy and sophistication. Whitespace is generous and deliberate, allowing complex travel and expense workflows to feel uncluttered. The overall mood is confident, trustworthy, and aspirational—designed to make corporate travel management feel effortless and intelligent.

**Key Characteristics**

- Bold, saturated purple brand identity with gradient overlays for visual depth
- Serif display typography contrasted against lightweight sans-serif body text
- Pill-shaped buttons (`{rounded.full}` — `9999px`) emphasizing friendliness and approachability
- Minimal shadows relying on color blocking rather than depth manipulation
- Generous spacing and breathing room throughout layouts
- Negative letter-spacing on display typography creating tighter, premium headlines
- Enterprise SaaS aesthetic with contemporary micro-interactions

## 2. Color Palette & Roles

### Primary

- **Brand Primary** (`{colors.primary}` — `#15002C`): Deep navy-purple used for primary CTAs, brand mark, and active states. The foundational brand identity color for filled buttons, hero accents, and primary navigation highlights.
- **Brand Accent** (`{colors.accent}` — `#6307F8`): Vibrant purple deployed for secondary CTAs, hero bands, and decorative gradients. Creates visual interest and guides eye to complementary actions.

### Accent Colors (Decorative)

- **Accent Decorative 1** (`{colors.accent-1}` — `#A9A9BC`): Muted mauve. No defined role; used ornamentally in gradients and background layers.
- **Accent Decorative 2** (`{colors.accent-2}` — `#C185E5`): Light lavender. Decorative gradient stop with no semantic function.
- **Accent Decorative 3** (`{colors.accent-3}` — `#DA9EFF`): Soft magenta. Gradient accent layer for visual embellishment.
- **Accent Decorative 4** (`{colors.accent-4}` — `#E1E2FE`): Pale lilac. Lightest decorative accent, often used in background fills and micro-interactions.
- **Accent Decorative 5** (`{colors.accent-5}` — `#07072C`): Near-black purple. Decorative depth layer, occasionally paired with primary for tonal contrast.

### Neutral Scale

- **Canvas** (`{colors.canvas}` — `#FFFFFF`): Default page background and label text on brand surfaces. High contrast with ink for readability.
- **Surface Alt** (`{colors.surface-alt}` — `#F1F1F9`): Alternating section background, subtle band separation. Provides soft visual rhythm without disruption.
- **Ink** (`{colors.ink}` — `#060000`): Primary heading and body text. Near-black for maximum contrast and accessibility.
- **Neutral 1** (`{colors.neutral-1}` — `#C6C6D2`): Mid-gray for secondary text, disabled states, and decorative dividers.
- **Neutral 2** (`{colors.neutral-2}` — `#D1D5DB`): Lighter gray for borders, subtle rules, and form field backgrounds.

## 3. Typography Rules

### Font Family

**Primary Display Font: Sanomat**
- Serif display typeface used exclusively for headlines, page titles, and major headings
- Fallback stack: `Sanomat, Georgia, serif`

**Secondary Body Font: Inter**
- Humanist sans-serif for all body copy, labels, buttons, and navigation
- Fallback stack: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|---|---|---|---|---|---|---|
| Display Large | Sanomat | 45px | 600 | 1.2 | 0px | Hero headlines; primary page title |
| Display Large Tight | Sanomat | 45px | 600 | 1.0 | -2px | Compact headlines; tighter vertical spacing |
| Display Medium | Sanomat | 40px | 500 | 1.35 | 0px | Secondary display; section openers |
| Heading Medium | Sanomat | 34px | 400 | 1.24 | 0px | Tertiary headings; content sections |
| Heading Small | Sanomat | 30px | 600 | 2.13 | 0px | Subsection titles; feature callouts |
| Heading Extra Small | Inter | 19px | 700 | 1.47 | -2px | Card titles; smaller section headers |
| Body Large | Inter | 19px | 700 | 1.32 | -2px | Emphasis text; feature highlights |
| Body Medium | Inter | 16px | 300 | 1.5 | -2px | Primary body copy; list items |
| Body Small | Inter | 15px | 300 | 1.6 | -2px | Secondary body text; descriptions |
| Body Small Tight | Inter | 15px | 300 | 1.5 | -2px | Compact body; reduced line height |
| Button Medium | Inter | 17px | 400 | 1.88 | -2px | Large CTA buttons; primary actions |
| Button Small | Inter | 15px | 300 | 1.33 | -2px | Secondary buttons; reduced emphasis |
| Button Small Strong | Inter | 15px | 400 | 1.4 | -2px | Bold secondary buttons |
| Button Small Loose | Inter | 15px | 400 | 1.6 | -2px | Spacious secondary buttons |
| Button Small Tight | Inter | 15px | 300 | 1.2 | -2px | Compact button text |
| Button Extra Small | Inter | 14px | 400 | 1.43 | -2px | Tertiary / minimal buttons |
| Navigation | Inter | 14px | 400 | 1.36 | -2px | Primary navigation links; header menu |
| Label | Inter | 14px | 300 | 1.36 | -2px | Form labels; field captions |
| Body Extra Small | Inter | 13px | 300 | 1.31 | -2px | Fine print; disclaimers |
| Body Extra Small Strong | Inter | 13px | 400 | 1.46 | -2px | Bold fine print; form hints |
| Caption Extra Small | Inter | 12px | 300 | 1.58 | -2px | Smallest text; timestamps, metadata |
| Caption Extra Small Tight | Inter | 12px | 300 | 1.5 | -2px | Compact caption |
| Caption Extra Small Strong | Inter | 12px | 700 | 1.58 | -2px | Bold caption; strong metadata |

### Principles

- **Negative Letter-Spacing on Display**: Sanomat headlines and all Inter text employ `-2px` letter-spacing, creating a premium, tightly-kerned aesthetic that reads as sophisticated and intentional.
- **Weight Contrast**: Display typography favors bolder weights (500–600) for emphasis, while body text uses lighter weights (300) for legibility and visual rest.
- **Serif + Sans Pairing**: Serif headlines signal gravitas and editorial intent; sans-serif body ensures legibility at small sizes and modern approachability.
- **Line Height Modulation**: Display text uses tighter line heights (1.0–1.24) for density; body text opens to 1.5–1.6 for comfortable reading and whitespace.
- **Hierarchy Density**: Each typographic role is distinct in size, weight, or spacing to prevent visual ambiguity and ensure clear information scanning.

## 4. Component Stylings

### Buttons

**Button — Primary Filled**
- Background: `{colors.primary}` (`#15002C`)
- Text Color: `{colors.canvas}` (`#FFFFFF`)
- Typography: `{typography.button-xs}` (14px, weight 400, line-height 1.43)
- Padding: `10px 28px`
- Border Radius: `{rounded.full}` (9999px)
- Border: `2px solid {colors.primary}` (`#15002C`)
- Height: 44px
- Box Shadow: none
- Interaction: Disabled state applies `border-color: var(--gray-400)` and `background-color: var(--gray-400)`

**Button — Filled Secondary**
- Background: `{colors.accent}` (`#6307F8`)
- Text Color: `{colors.canvas}` (`#FFFFFF`)
- Typography: `{typography.button-sm-strong}` (15px, weight 400, line-height 1.4)
- Padding: `10px 28px`
- Border Radius: `{rounded.full}` (9999px)
- Border: `2px solid {colors.accent}` (`#6307F8`)
- Height: 42px
- Box Shadow: none

**Button — Filled Large**
- Background: `{colors.accent}` (`#6307F8`)
- Text Color: `{colors.canvas}` (`#FFFFFF`)
- Typography: `{typography.button-xs}` (14px, weight 400, line-height 1.43)
- Padding: `10px 28px`
- Border Radius: `{rounded.full}` (9999px)
- Border: `2px solid {colors.accent}` (`#6307F8`)
- Height: 44px
- Box Shadow: none

**Button — Outline**
- Background: transparent (rgba(0, 0, 0, 0))
- Text Color: `{colors.primary}` (`#15002C`)
- Typography: `{typography.body-sm}` (15px, weight 300, line-height 1.6)
- Padding: `10px 46px`
- Border Radius: `{rounded.full}` (9999px)
- Border: `1px solid {colors.primary}` (`#15002C`)
- Height: 46px
- Box Shadow: none

**Button — Outline Small**
- Background: transparent (rgba(0, 0, 0, 0))
- Text Color: `{colors.primary}` (`#15002C`)
- Typography: `{typography.body-xs-strong}` (13px, weight 400, line-height 1.46)
- Padding: `10px 28px`
- Border Radius: `{rounded.full}` (9999px)
- Border: `1px solid {colors.primary}` (`#15002C`)
- Height: 41px
- Box Shadow: none

### Cards & Containers

**Card — Default (Transparent)**
- Background: transparent (rgba(0, 0, 0, 0))
- Text Color: `{colors.ink}` (`#060000`)
- Typography: `{typography.body-md}` (16px, weight 300, line-height 1.5)
- Border: none (0px)
- Border Radius: `{rounded.none}` (0px)
- Padding: 0px
- Box Shadow: none
- Use: Flexible content containers without visual enclosure

**Card — Default Elevated**
- Background: `{colors.canvas}` (`#FFFFFF`)
- Text Color: `{colors.ink}` (`#060000`)
- Typography: `{typography.body-md}` (16px, weight 300, line-height 1.5)
- Border: none (0px)
- Border Radius: `{rounded.md}` (14px)
- Padding: 0px
- Box Shadow: `rgba(0, 0, 0, 0.13) 0px 1px 12px 0px`
- Use: Elevated content blocks with subtle shadow separation

### Inputs & Forms

**Input — Default (Text)**
- Background: `{colors.canvas}` (`#FFFFFF`)
- Text Color: `{colors.ink}` (`#060000`)
- Typography: `{typography.body-md}` (16px, weight 300, line-height 1.5)
- Border Radius: `{rounded.xs}` (8px)
- Border: `1px solid {colors.neutral-2}` (`#D1D5DB`)
- Padding: varies by input height
- Interaction — Focus: `outline: transparent solid 2px`, `border-color: {colors.ink}` (`#060000`), `background-color: {colors.canvas}` (`#FFFFFF`)

### Navigation

**Navigation Bar — Default**
- Background: transparent (rgba(0, 0, 0, 0))
- Text Color: `{colors.ink}` (`#060000`)
- Typography: `{typography.nav}` (14px, weight 400, line-height 1.36)
- Border: none (0px)
- Border Radius: `{rounded.none}` (0px)
- Padding: `0px 20px`
- Height: 77px
- Box Shadow: none
- Use: Primary horizontal navigation; full-width header container

**Navigation Link — Default**
- Background: transparent (rgba(0, 0, 0, 0))
- Text Color: `{colors.ink}` (`#060000`)
- Typography: `{typography.body-lg}` (19px, weight 700, line-height 1.32)
- Border: none (0px)
- Border Radius: `{rounded.none}` (0px)
- Padding: `8px 0px`
- Box Shadow: none
- Interaction — Hover: `border-color: var(--edge-purple-link-hover, #3F1F9F)`

**Navigation Link — Secondary (Header Menu)**
- Background: transparent (rgba(0, 0, 0, 0))
- Text Color: `{colors.primary}` (`#15002C`)
- Typography: `{typography.nav}` (14px, weight 400, line-height 1.36)
- Border: none (0px)
- Border Radius: `{rounded.none}` (0px)
- Padding: 0px
- Height: 77px
- Box Shadow: none
- Use: Top navigation menu items

## 5. Layout Principles

### Spacing System

Navan employs an 8-pixel base unit system with a 10-value scale:

- `{spacing.xxs}` = 4px (micro-spacing; button internal gaps)
- `{spacing.xs}` = 8px (tight spacing; element separation)
- `{spacing.sm}` = 12px (small spacing; form field margins)
- `{spacing.md}` = 16px (default spacing; component padding, body gutters)
- `{spacing.lg}` = 20px (medium spacing; section spacing, card padding)
- `{spacing.xl}` = 24px (large spacing; feature block separation)
- `{spacing.xxl}` = 28px (extra-large spacing; hero section padding)
- `{spacing.xxxl}` = 32px (premium spacing; major section top/bottom padding)
- `{spacing.section}` = 40px (section block spacing; between major content areas)
- `{spacing.band}` = 44px (hero band padding; full-width section vertical rhythm)

**Usage Context**: Horizontal padding scales from `{spacing.md}` (16px) on mobile to `0px` on desktop, allowing content to scale fluidly without sacrificing breathing room.

### Grid & Container

- **Desktop Max Width**: 1230px (measured at 1280px+ viewports)
- **Tablet Width**: 760px (measured at 768px)
- **Mobile Width**: 367px (measured at 375px)
- **Column Structure**: 6-column grid system responsive across all breakpoints (confirmed at 375px, 768px, 1024px, 1280px, 1440px)
- **Section Padding**: 
  - Mobile (375px, 768px, 1024px): `{spacing.xl}` (24px) on each side = 48px total horizontal
  - Desktop (1280px+): `0px` (content spans full width with centered container)

### Whitespace Philosophy

Whitespace is treated as a primary design element, not negative space. Generous margins between sections (`{spacing.section}` — 40px and `{spacing.band}` — 44px) create breathing room and reduce cognitive load. Typography line heights (1.5–1.6 on body) provide internal whitespace. Cards and components float in whitespace rather than occupying grid cells edge-to-edge, creating a sense of lightness and hierarchy. Mobile layouts maintain proportional spacing; desktop spreads content horizontally without collapsing margins, emphasizing openness.

### Border Radius Scale

- `{rounded.none}` = 0px: Navigation, cards without elevation, image containers, flat structural elements
- `{rounded.xs}` = 8px: Input fields, form controls, subtle rounded corners
- `{rounded.sm}` = 12px: Reserved (measured but not currently deployed in component variants)
- `{rounded.md}` = 14px: Elevated cards, containers with subtle shadow depth
- `{rounded.full}` = 9999px: All interactive button elements (primary, secondary, outline), creating strong affordance for clickability

### Border Widths

- **Thin**: `1px` (outline buttons, input borders, secondary UI rules)
- **Medium**: `2px` (filled button borders, primary UI emphasis)

## 6. Depth & Elevation

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow; color blocking only | Navigation, transparent cards, backgrounds |
| Micro | `rgba(0, 0, 0, 0.13) 0px 1px 12px 0px` | Subtle elevation; floating cards, form containers |
| Small | `rgba(0, 0, 0, 0.25) 0px 25px 50px -12px` | Dropdown menus, modals, prominent overlays |
| Medium | `rgba(0, 0, 0, 0.13) 0px 1px 12px 0px` | Consistent with Micro; repeated use for visual cohesion |
| Large | `rgba(0, 0, 0, 0.18) 2.99403px 2.99403px 5.98806px 0px` | Deep elevation; full-page modals, hero overlays |

**Shadow Philosophy**: Navan employs a **layered-micro** approach: rather than progressive shadow increases, the system relies on a single core shadow (`rgba(0, 0, 0, 0.13) 0px 1px 12px 0px`) with optional larger variations for modal/overlay contexts. Color blocking (whitespace and surface color changes) provides primary visual separation; shadows are supplementary and subtle. This keeps the design feeling lightweight and modern, avoiding heavy 3D effects.

### Opacity Levels

- **20%** (`0.20`): Severely faded text, very light overlays
- **50%** (`0.50`): Disabled inputs, placeholder text
- **60%** (`0.60`): Hover states, secondary emphasis
- **80%** (`0.80`): Active states, strong emphasis
- **85%** (`0.85`): Semi-transparent overlays, modals
- **93%** (`0.93`): Near-opaque states, almost-full visibility

### Z-index / Layering

- **Base Layer**: `z-index: 1` (default document flow; body text, cards)
- **Secondary Layer**: `z-index: 5` (elevated above base; sticky headers, secondary UI)
- **Dropdown Layer**: `z-index: 10` (floating menus, form dropdowns)
- **Dropdown Elevated**: `z-index: 20` (nested dropdowns, modal backgrounds)
- **Modal/Overlay**: `z-index: 50` (full-page modals, primary overlays)
- **Modal Focus**: `z-index: 51` (modal content, topmost layer; ensures modal remains on top of all other elements)

## 7. Do's and Don'ts

### Do

- **Use pill-shaped buttons** (`{rounded.full}` — 9999px) for all primary, secondary, and outline CTAs. The rounded aesthetic signals interactivity and maintains consistency across the interface.
- **Leverage Sanomat serif headlines** for page titles, section headers, and major feature callouts. Pair with negative tracking (`-2px`) for premium, editorial feel.
- **Maintain generous spacing** between sections (`{spacing.section}` and `{spacing.band}`). Whitespace reduces cognitive load and guides user focus.
- **Apply color blocking over shadows** for depth. Reserve shadows for micro-elevation (cards) and major overlays (modals). Rely on neutral backgrounds and accent highlights.
- **Use the primary brand color** (`{colors.primary}` — `#15002C`) for main CTAs and critical user actions. Reserve the accent purple (`{colors.accent}` — `#6307F8`) for secondary actions and visual embellishment.
- **Follow the responsive breakpoint strategy**: Adjust type sizes and padding proportionally; do not collapse the 6-column grid.
- **Implement focus states on inputs** with `outline: transparent solid 2px` and `border-color: {colors.ink}`. Ensure keyboard accessibility.
- **Use `{typography.nav}` (14px, weight 400)** for primary navigation links and header menus for consistency.

### Don't

- **Do not invent new button shapes or borders**. All buttons must be `{rounded.full}` with either `1px` or `2px` solid borders.
- **Do not use drop shadows as primary depth cues**. Shadows are supplementary; rely on color contrast and spacing.
- **Do not exceed the responsive column count (6 columns)**. Maintain grid consistency across breakpoints.
- **Do not reduce section padding below `{spacing.md}` (16px)** on mobile or below `0px` on desktop. Preserve breathing room.
- **Do not mix serif and sans fonts within a single text element**. Maintain font-family separation: Sanomat for display, Inter for body/buttons/nav.
- **Do not apply more than one shadow to a single element**. Choose flat, micro, or modal elevation — not combinations.
- **Do not override the negative letter-spacing on Inter text** (`-2px`). This is a defining typographic trait.
- **Do not use decorative accent colors** (`{colors.accent-1}` through `{colors.accent-5}`) for semantic roles (error, success, etc.). These are gradient and background-only colors.
- **Do not apply disabled states to buttons without visual feedback**. Always apply `background-color: var(--gray-400)` and `border-color: var(--gray-400)` to disabled buttons.

## 8. Responsive Behavior

### Breakpoints

| Viewport | Width | Column Grid | Nav Visible | Section Padding-x | Heading Size | Body Size |
|---|---|---|---|---|---|---|
| Mobile Small | 375px | 6 | 0 links (menu toggle) | 24px | 28px | 16px |
| Tablet | 768px | 5 | 0 links (menu toggle) | 24px | 45px | 16px |
| Desktop Small | 1024px | 6 | 0 links (menu toggle) | 24px | 45px | 16px |
| Desktop Medium | 1280px | 6 | 4 links (nav visible) | 0px | 45px | 16px |
| Desktop Large | 1440px | 6 | 4 links (nav visible) | 0px | 45px | 16px |

**Breakpoint Strategy**: The navigation collapses at 1024px and below (menu toggle appears); desktop (1280px+) reveals 4 inline nav links. Section padding reduces from `{spacing.xl}` (24px) on mobile/tablet to `0px` on desktop (content uses centered max-width container instead). Display heading sizes jump from ~28px (mobile) to 45px (desktop) at 768px+. Body typography remains 16px throughout, with line-height adjustments for rhythm.

### Touch Targets

- **Minimum Interactive Height**: 44px (buttons, link hit areas)
- **Minimum Interactive Width**: Ensure buttons have minimum 80px width for comfortable tap targets; nav links 60px+ for finger accuracy
- **Spacing Between Targets**: At least `{spacing.md}` (16px) vertical spacing between adjacent interactive elements to prevent accidental taps

### Collapsing Strategy

- **Navigation**: Menu toggle (hamburger icon) appears at 1024px and below; primary navigation links hide. At 1280px+, 4 nav items display inline in header.
- **Layout Width**: Content column contracts from 367px (375px viewport) → 760px (768px) → 884px (1024px) → 1230px (1280px+). Max container remains 1230px; padding adjusts on smaller screens.
- **Typography Scaling**: Display headings (`{typography.display-lg}` — 45px) reduce to ~28px on mobile; body remains 16px throughout. Button text follows Inter hierarchy; no size collapse.
- **Grid Reflow**: 6-column grid maintains structure across all breakpoints; content reflows into fewer columns visually but grid count remains consistent.
- **Spacing Compression**: Section padding (`{spacing.section}` — 40px) and band padding (`{spacing.band}` — 44px) remain proportional; no aggressive margin collapse on mobile to preserve breathing room.

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA Fill**: Brand Primary (`{colors.primary}` — `#15002C`)
- **Secondary CTA Fill**: Brand Accent (`{colors.accent}` — `#6307F8`)
- **Body & Heading Text**: Ink (`{colors.ink}` — `#060000`)
- **Page Background**: Canvas (`{colors.canvas}` — `#FFFFFF`)
- **Section Band (Alternating)**: Surface Alt (`{colors.surface-alt}` — `#F1F1F9`)
- **Input Borders & Dividers**: Neutral 2 (`{colors.neutral-2}` — `#D1D5DB`)
- **Secondary Text & Disabled**: Neutral 1 (`{colors.neutral-1}` — `#C6C6D2`)

### Iteration Guide

1. **All buttons are pill-shaped** (`{rounded.full}` — 9999px) with white text on dark or vibrant backgrounds. Use `2px` borders for filled buttons, `1px` for outlines.
2. **Display typography (headlines) is serif (Sanomat)** at sizes 30–45px with negative letter-spacing (`-2px`). Body and button text is sans-serif (Inter) with same `-2px` letter-spacing.
3. **Responsive grid is 6 columns** across all breakpoints; content width expands (367px → 1230px) but column count and structure remain fixed.
4. **Navigation collapses to hamburger menu below 1280px**; four nav links appear only on desktop.
5. **Spacing uses an 8px base unit**: micro (4px) for component internals, default (16px) for padding/margins, sections (40–44px) for major block separation.
6. **Shadows are subtle and flat-friendly**: Use `rgba(0, 0, 0, 0.13) 0px 1px 12px 0px` for card elevation only; avoid heavy shadows. Color blocking and whitespace provide primary depth.
7. **Input focus states**: `border-color: #060000` and `outline: transparent solid 2px`. Disabled buttons: `background-color: var(--gray-400)` and `border-color: var(--gray-400)`.
8. **Accent colors** (`{colors.accent-1}` through `{colors.accent-5}`) are decorative only; reserve them for gradients and background tints. Do not use for semantic status (error, success, warning).
9. **Line heights vary by role**: Display 1.0–1.35, body 1.5–1.6, buttons 1.4–1.88. Tighter line heights create premium headlines; looser line heights aid body legibility.
10. **Section padding on mobile is `{spacing.xl}` (24px) per side; desktop is `0px` with centered 1230px container**. Never collapse horizontal spacing below 16px on mobile.

## 10. Known Gaps

- **Semantic Status Colors**: The site does not expose error, success, warning, or info color roles. No semantic status ramp was extracted; use known accent colors contextually or add custom status colors outside this system.
- **Unassigned Decorative Colors**: Seven color tokens (`{colors.accent-1}` through `{colors.accent-5}`, plus `{colors.neutral-1}` and `{colors.neutral-2}`) have no measured semantic role. These are treated as gradient and tint layers only; do not invent new use cases for them.
- **Interaction States**: Hover states for buttons (fill color, scale, transform) were not fully captured in the extraction. Only disabled state (`background-color: var(--gray-400)`) is confirmed. Implement standard hover practices (subtle opacity or scale reduction) or measure live behavior.
- **Dark Mode**: No dark-mode variant was extracted. The design system is light-mode only; dark-mode behavior is not documented.
- **Animation & Transition Timing**: No easing curves, durations, or keyframe animations were measured. Micro-interactions and page transitions are not defined in this extraction.
- **Authenticated / Logged-In Surfaces**: Only the public homepage and marketing pages were analyzed. Surfaces behind authentication (dashboard, user account pages, admin panels) were not visited and are outside this document's scope.
- **Advanced Component States**: Loading states, skeleton screens, empty states, and error recovery UI were not observed and are not documented.
- **Breakpoint Behavior at Edge Cases**: Behavior at exact breakpoint boundaries (e.g., 1279px vs. 1280px) was not granularly tested; transitions may differ from stated behavior.
- **CSS Custom Properties (Variables)**: Hover link states reference CSS variables (e.g., `var(--edge-purple-link-hover)`, `var(--gray-400)`) which were not extracted with full token mapping. Implementation may require variable re-mapping or color substitution.
- **Icon System**: No icon library, naming convention, or sizing scale was extracted. Icon usage and styling are not documented.

---

**YAML Tokens** *(prepended automatically by the document generation system)*