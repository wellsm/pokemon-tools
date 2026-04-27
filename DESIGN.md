---
name: Technical Precision
colors:
  surface: '#111318'
  surface-dim: '#111318'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#ebbbb4'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#b18780'
  outline-variant: '#603e39'
  surface-tint: '#ffb4a8'
  primary: '#ffb4a8'
  on-primary: '#690100'
  primary-container: '#ff5540'
  on-primary-container: '#5c0000'
  inverse-primary: '#c00100'
  secondary: '#bdf4ff'
  on-secondary: '#00363d'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#c7c6c6'
  on-tertiary: '#303031'
  tertiary-container: '#919090'
  on-tertiary-container: '#292a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930100'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#e4e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#111318'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1280px
---

## Brand & Style

This design system is built for the competitive Pokémon TCG player who views the game through the lens of data and strategy. The brand personality is rooted in **Technical Precision**—it is a tool first, stripping away the whimsical elements of the franchise to focus on utility, speed, and clarity.

The visual style is a fusion of **Minimalism** and **High-Tech Glassmorphism**. It utilizes a "Dark Mode First" philosophy to reduce eye strain during long tournament sessions. Interfaces should feel like a high-end tactical HUD: clean, authoritative, and sophisticated. The emotional response should be one of confidence and efficiency, positioning the user as a professional analyst rather than a casual player.

## Colors

The palette is anchored by a deep, monochromatic foundation to ensure high-tech contrast.

- **Foundational Neutrals:** The primary background is a Deep Navy (#0A0C10), with Charcoal (#1F2229) used for container surfaces to create subtle depth.
- **Accents:** 'Pokédex Red' (#FF0000) is reserved strictly for primary actions, critical alerts, and destructive states. 'Electric Blue' (#00E5FF) serves as the secondary interactive color, used for links, active toggles, and data highlights.
- **Status Indicators:** To maintain the professional tone, status colors use a slightly desaturated "Matte" finish, ensuring they communicate information without clashing with the primary accents.

## Typography

The design system utilizes **Inter** exclusively to leverage its systematic, utilitarian nature. The type scale is designed for high information density.

- **Headlines:** Use Bold and Extra Bold weights with tighter letter spacing to create a sense of structural strength.
- **Body:** Regular weight is used for readability, with a slightly increased line height to ensure data-heavy card descriptions remain legible.
- **Data Labels:** The `label-caps` style is used for table headers and metadata (e.g., HP, Stage, Retreat Cost), providing a clear "form-fill" aesthetic common in technical tools.

## Layout & Spacing

The layout follows a **Fluid Grid** model based on a 4px baseline unit.

- **Grid:** A 12-column system is used for desktop views to allow for complex side-by-side card comparisons. Mobile views collapse to a single column with consistent 16px side margins.
- **Rhythm:** Ample whitespace is intentionally placed between functional groups (e.g., Deck List vs. Probability Calculator) to prevent cognitive overload.
- **Density:** While whitespace is used for hierarchy, internal component padding is kept tight to maximize the amount of "at-a-glance" information available to the player.

## Elevation & Depth

Depth in the design system is communicated through **Tonal Layers** and **Low-Contrast Outlines** rather than traditional shadows.

1.  **Level 0 (Floor):** The base background (#0A0C10).
2.  **Level 1 (Cards/Panels):** Charcoal (#1F2229) surfaces with a subtle 1px border (#ffffff10).
3.  **Level 2 (Modals/Popovers):** A slightly lighter charcoal with a subtle background blur (8px) to create a "glass" overlay effect, suggesting a temporary state above the workspace.

Shadows, when used, are extremely diffuse and tinted with the primary accent color (e.g., a faint red glow for an active card) to simulate a high-tech illuminated display.

## Shapes

The design system employs a **Rounded** shape language to balance the "tech" aesthetic with modern accessibility.

- **Base Radius:** 0.5rem (8px) for small interactive elements like inputs and buttons.
- **Large Radius:** 1rem (16px) for primary containers and cards. This large radius softens the dark, high-contrast palette, making the tool feel approachable.
- **Pill Shapes:** Used exclusively for "Status Chips" (e.g., Type energy, Special Conditions) to distinguish them from actionable buttons.

## Components

The component library is optimized for rapid data entry and retrieval.

- **Buttons:** Primary buttons use a solid 'Pokédex Red' fill with white text. Secondary buttons use an 'Electric Blue' outline with a subtle glass-fill on hover.
- **Cards:** The core of the design system. Cards utilize a 1px border and a large 16px radius. Header areas within cards should have a distinct background tint to separate titles from body data.
- **Inputs:** Darker than the surface level with an Electric Blue bottom-border focus state. Icons (search, filter) are mandatory for quick visual scanning.
- **Status Chips:** Small, pill-shaped badges using the Matte status colors. Text is bold and compact.
- **Utility Components:** Include a "Quick-Stats" sidebar for deck probability and a "Visualizer" component for price history graphs, using clean vector lines and no fills.
- **Iconography:** Use "Linear" icons with a 2px stroke weight. Avoid filled icons to maintain the minimalist, airy feel of the interface.
