# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application showcasing "Nano Banana" - an AI image editing landing page. The project uses the App Router architecture with React Server Components and integrates with the `same-runtime` library for enhanced functionality.

## Development Commands

### Running the Application
```bash
# Development server with Turbopack (binds to all network interfaces)
npm run dev
# or
bun dev

# Production build
npm run build

# Start production server
npm run start
```

### Code Quality
```bash
# Run TypeScript type checking AND Next.js linting
npm run lint

# Format code with Biome
npm run format
# or
bunx biome format --write
```

## Tech Stack & Architecture

### Core Technologies
- **Next.js 15.3.2** with App Router and React Server Components
- **TypeScript** with strict mode enabled
- **Tailwind CSS** for styling with custom configuration
- **shadcn/ui** components (New York style variant)
- **Biome** for code formatting and linting (NOT Prettier/ESLint)
- **same-runtime** - Custom JSX runtime loaded via external script

### Key Configuration Details

#### JSX Runtime
The project uses a custom JSX runtime (`same-runtime`) instead of React's default:
- Configured in [tsconfig.json:15](tsconfig.json#L15): `"jsxImportSource": "same-runtime/dist"`
- Loaded globally via script tag in [src/app/layout.tsx:30-33](src/app/layout.tsx#L30-L33)
- This affects how JSX is transformed and may impact component behavior

#### Path Aliases
- `@/*` maps to `./src/*` - use this for all internal imports
- shadcn/ui specific aliases configured in [components.json](components.json):
  - `@/components` - React components
  - `@/lib/utils` - Utility functions
  - `@/ui` - UI components
  - `@/hooks` - Custom hooks

#### Image Configuration
Next.js image optimization is disabled (`unoptimized: true`). Allowed image domains:
- `source.unsplash.com`
- `images.unsplash.com`
- `ext.same-assets.com`
- `ugc.same-assets.com`

#### Hydration Handling
The app uses a custom [ClientBody.tsx](src/app/ClientBody.tsx) component to handle hydration mismatches caused by browser extensions. This wrapper removes extension-added classes during client-side hydration.

### Component Architecture

#### Layout Structure
- Root layout: [src/app/layout.tsx](src/app/layout.tsx)
  - Loads Geist fonts (sans and mono)
  - Includes `same-runtime` script in `<head>`
  - Wraps children in `ClientBody` for hydration safety
  - Uses `suppressHydrationWarning` on body element

#### UI Components
All UI components are from shadcn/ui (New York variant) located in `src/components/ui/`:
- `accordion.tsx` - Collapsible FAQ sections
- `badge.tsx` - Status/label badges
- `button.tsx` - Primary action buttons with variants
- `card.tsx` - Content containers
- `dropdown-menu.tsx` - Navigation dropdowns

These components use:
- `class-variance-authority` for variant management
- `tailwind-merge` via `cn()` utility in [src/lib/utils.ts](src/lib/utils.ts)
- `lucide-react` for icons

### Styling Approach
- Tailwind CSS with custom theme (zinc base color)
- CSS variables enabled for theming
- Gradient-heavy design (yellow-to-orange color scheme)
- Responsive design with mobile-first breakpoints

## Deployment

### Netlify Configuration
The project is configured for Netlify deployment ([netlify.toml](netlify.toml)):
- Build command: `bun run build`
- Publish directory: `.next`
- Uses `@netlify/plugin-nextjs`
- Remote image patterns configured for allowed domains

## Code Style & Linting

### Biome Configuration
- **Formatter**: 2-space indentation, double quotes for strings
- **Linter**: Recommended rules enabled with exceptions:
  - Unused variables check disabled
  - Most a11y rules disabled (noAutofocus, noLabelWithoutControl, etc.)
  - `noImgElement` disabled (uses `<img>` instead of Next.js `<Image>`)
- **Files**: Only lints/formats `src/**/*.ts` and `src/**/*.tsx`
- **Ignored**: `dist`, `.next`, `node_modules`, `build`, `src/generated/**`

### TypeScript Configuration
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler
- JSX preserved (transformed by custom runtime)

## Important Notes

1. **Custom JSX Runtime**: The `same-runtime` dependency changes how JSX works. Be cautious when adding React features that depend on standard JSX transformation.

2. **Hydration Warnings**: The `suppressHydrationWarning` and `ClientBody` wrapper exist to handle browser extension interference. Don't remove these without understanding the hydration implications.

3. **Image Optimization**: Images are not optimized by Next.js. Consider file sizes when adding new images.

4. **Biome vs ESLint**: This project uses Biome for both formatting and linting. Don't add Prettier or additional ESLint configs.

5. **Development Server**: The dev server binds to `0.0.0.0` (all network interfaces) with Turbopack enabled for faster builds.
