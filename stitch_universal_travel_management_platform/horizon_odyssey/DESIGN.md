---
name: Horizon Odyssey
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#414754'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#717786'
  outline-variant: '#c1c6d7'
  surface-tint: '#005bc0'
  primary: '#0059bb'
  on-primary: '#ffffff'
  primary-container: '#0070ea'
  on-primary-container: '#fefcff'
  inverse-primary: '#adc7ff'
  secondary: '#994700'
  on-secondary: '#ffffff'
  secondary-container: '#fb7800'
  on-secondary-container: '#592600'
  tertiary: '#545d65'
  on-tertiary: '#ffffff'
  tertiary-container: '#6d767e'
  on-tertiary-container: '#fcfcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc7ff'
  on-primary-fixed: '#001a41'
  on-primary-fixed-variant: '#004493'
  secondary-fixed: '#ffdbc8'
  secondary-fixed-dim: '#ffb68b'
  on-secondary-fixed: '#321200'
  on-secondary-fixed-variant: '#753400'
  tertiary-fixed: '#dbe4ed'
  tertiary-fixed-dim: '#bfc8d0'
  on-tertiary-fixed: '#141d23'
  on-tertiary-fixed-variant: '#3f484f'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system is built for a premium travel experience, bridging the gap between high-energy consumer discovery and efficient professional management. The brand personality is **adventurous, dependable, and airy**. It aims to evoke a sense of "boundless possibility" through the use of expansive whitespace and large-scale photography.

The visual style combines **Modern Minimalism** with **Glassmorphism**. High-quality travel imagery serves as the primary "texture" of the UI, while functional elements float on translucent, blurred containers. This creates a sense of depth and lightness, ensuring the interface feels like a window to the world rather than a digital tool.

The target audience ranges from spontaneous leisure travelers seeking inspiration on a landing page to travel agents and frequent fliers managing complex itineraries in a dashboard environment.

## Colors

The palette is anchored by **Sky Blue**, representing the horizon and reliability. **Sunset Orange** is utilized exclusively for high-priority Call-to-Action (CTA) elements and notifications, providing a warm, energetic contrast that mimics a golden hour glow.

The neutral system uses "Cool Grays" to maintain a clean, clinical feel in administrative sections without feeling sterile. 
- **Surface:** Pure white (#FFFFFF) for cards and main content areas.
- **Background:** Softest gray (#F8F9FA) to differentiate the page from the content containers.
- **Accents:** Semi-transparent versions of the primary blue are used for selection states and subtle highlights.

## Typography

The design system employs **Inter** for its exceptional legibility across both marketing and data-dense dashboard views. 

The type hierarchy is designed with high contrast between headers and body text. **Display** and **Headline** levels use tight letter-spacing and heavy weights to command attention over photographic backgrounds. **Body** text is set with generous line-height to ensure comfort during long-form reading of destination guides. **Labels** use a medium weight and slight tracking to differentiate metadata from body content.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a 12-column structure for desktop and a 4-column structure for mobile. 

The spacing rhythm is based on an **8px linear scale**, favoring "Wide" spacing to reinforce the brand's "Airy" feel. 
- **Landing Pages:** Utilize `lg` and `xl` spacing for vertical sections to create a premium, editorial flow.
- **Dashboards:** Utilize `sm` and `md` spacing to maximize information density while maintaining the rounded aesthetic.
- **Margins:** Desktop views should maintain large 64px side margins to "frame" the content, making it feel curated.

## Elevation & Depth

Hierarchy is established through **Tonal Layering** and **Ambient Shadows**. 

1.  **Level 0 (Base):** The neutral background (#F8F9FA).
2.  **Level 1 (Card/Surface):** White surfaces with a very soft, diffused shadow (0px 4px 20px rgba(0,0,0,0.05)).
3.  **Level 2 (Navigation/Floating):** Use of Glassmorphism (Background blur: 20px, Opacity: 80%) with a subtle 1px white border to define edges against vibrant images.
4.  **Level 3 (Modals/Popovers):** Higher elevation with a deeper shadow (0px 12px 40px rgba(0,0,0,0.12)) to pull focus.

Shadow colors should never be pure black; they are slightly tinted with the primary blue (e.g., #001529 at low opacity) to keep the shadows "cool" and integrated with the palette.

## Shapes

The design system uses a **Rounded** shape language to evoke friendliness and modern comfort. 

- **Small elements (Buttons, Inputs):** 8px (0.5rem) radius.
- **Medium elements (Cards, Modals):** 16px (1rem) radius.
- **Large containers (Hero Image sections):** 24px (1.5rem) radius.
- **Avatars & Status Tags:** Fully circular (Pill-shaped) to distinguish them from structural UI components.

## Components

### Buttons
- **Primary:** Filled Sky Blue with white text. Rounded (0.5rem). High-contrast Sunset Orange used for "Book Now" or "Purchase" actions.
- **Secondary:** Transparent with a 1.5px Sky Blue border.
- **Ghost:** No background/border, blue text. Used for less critical navigation in the dashboard.

### Cards (Destinations)
The hallmark component. Large images with a 1rem corner radius. Typography is overlaid on the bottom using a soft black-to-transparent gradient to ensure legibility. Meta-data (price, rating) should be housed in a Level 2 glassmorphic pill floating in the top right.

### Input Fields
Soft gray backgrounds (#F1F3F5) with 0.5rem roundedness. On focus, the border transitions to a 2px Sky Blue stroke with a subtle outer glow.

### Navigation Bar
Top-fixed. On the landing page, it is transparent with white text until scroll; on the dashboard, it is a Level 2 glassmorphic surface with a blurred background to keep the user grounded in the visual context.

### Chips & Tags
Small, pill-shaped tags used for categories (e.g., "Beach", "Mountain"). Use low-saturation primary blue backgrounds with darker blue text for high legibility without distracting from the imagery.