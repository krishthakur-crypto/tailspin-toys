---
description: 'Central UI strategy and component development philosophy'
---

# UI Component Strategy

This file defines the central UI development strategy for Tailspin Toys. Technology-specific guidance is in separate instruction files.

## Component Architecture

### Technology Separation

- **Astro** (`.astro` files): Pages, layouts, components, routing, and static content. The site is fully prerendered (`output: 'static'`), so components render to HTML at build time.
- **Tailwind CSS** (utility classes): Styling
- **Astro `<script>`**: Reach for a small client-side script only when genuine interactivity is required — there is no client-side UI framework.

Refer to technology-specific instruction files:
- [`astro.instructions.md`](astro.instructions.md) - Astro pages, layouts, and components
- [`style.instructions.md`](style.instructions.md) - Tailwind CSS styling patterns

## Core Principles

### Testability

- Every interactive element MUST include a `data-testid` attribute
- Use descriptive test IDs that identify the element's purpose and context
- Examples: `data-testid="game-card-{game.id}"`, `data-testid="submit-button"`, `data-testid="nav-home"`

### Accessibility

- Use semantic HTML elements (`<nav>`, `<main>`, `<article>`, `<button>`)
- Provide ARIA labels and roles where semantic HTML isn't sufficient
- Use plain `<nav>` with `<a>`/`<button>` elements for site navigation — do **not** add `role="menu"`. Reserve `role="menu"` / `role="menuitem"` for true application-style menus that implement full composite keyboard semantics (arrow-key roving focus, Home/End, type-ahead)
- Loading states should use `role="status"` and `aria-live="polite"` for screen reader announcements
- Include Escape key handlers for dismissible elements (menus, modals)
- Ensure keyboard navigation works for all interactive elements, with proper focus management
- Include visible focus states: `focus:ring-2 focus:ring-blue-500 focus:outline-none`
- Maintain sufficient color contrast (especially in dark theme)

### Design Consistency

- Dark theme throughout the application
- Modern, clean UI with rounded corners and smooth transitions
- Consistent spacing and visual hierarchy
- Responsive design that works on mobile, tablet, and desktop

### Component Reusability

- Create reusable components for common UI patterns
- Keep components focused on a single responsibility
- Use props for configuration, not duplication
- Document component APIs with TypeScript types

### Commenting and Documentation Standards

- Comment the decision, constraint, or intent behind code — not the mechanics of the code that is already obvious from reading it.
- Prefer explaining why a branch exists, why a specific value is chosen, or why a workaround is required.
- Remove comments that merely restate the line below them or duplicate names already visible in the code.
- Treat stale comments as bugs: update or delete them with the same change that modifies the related logic.
- Every reusable `.astro` component should document its `Props` contract, and every exported function in `db/` and `src/lib/` should have JSDoc/TSDoc with parameter and return descriptions.

### TypeScript Formatting and Linting

- Use explicit TypeScript types for props, function parameters, and return values.
- Prefer named interfaces for object contracts and keep types close to the code that uses them.
- Keep imports grouped by external vs local modules and use the repository's existing single-quote, semicolon, 2-space style.
- Match the surrounding code's formatting rather than introducing new patterns in one-off edits.
- Run `npm run lint` after changes; the project relies on the ESLint defaults and recommended TypeScript rules for stable enforcement, while comment quality remains a documentation standard rather than a brittle comment-lint rule.

## Development Workflow

1. **Choose the right tool**: 
   - Content & structure → Astro components/pages
   - Styling → Tailwind
   - Client interactivity (rare) → a scoped Astro `<script>`

2. **Follow technology-specific patterns**: 
   - Refer to the appropriate instruction file

3. **Ensure testability**: 
   - Add `data-testid` to all interactive elements

4. **Verify accessibility**: 
   - Test keyboard navigation
   - Check focus states
   - Validate semantic structure
