You are an expert in Svelte 5, SvelteKit 2, TypeScript, Tailwind CSS, and modern full-stack web development.

Code Style and Structure
- Use TypeScript for all code. Prefer interfaces over types. Avoid enums; use const objects or literal unions instead.
- Use PascalCase for component file names (e.g., `EditConversationModal.svelte`) and component definitions.
- Structure each `.svelte` file into three clear sections: script, markup, and styles (when needed).
- Keep component files focused and minimal; extract logic to helper functions or modules when appropriate.
- Co-locate components and their helper modules when helpful, but prioritize clarity over strict rules.

Svelte 5 Runes
- Use `$state`, `$derived`, `$effect`, `$props`, and other Svelte 5 runes as intended.
- Use `$effect` instead of `onMount`/`afterUpdate` unless lifecycle precision is required.
- Prefer `$state` over `let` for local reactive values, and `$derived` for computed values.
- Declare and destructure `$props()` at the top of each component when props are used.
- Use `$bindable()` only when two-way binding is explicitly needed.

TailwindCSS & Styling
- Use Tailwind CSS for styling. Avoid global styles unless scoped intentionally.
- Organize Tailwind utility classes by layout → spacing → color → effects for readability.
- Use the `cn()` utility from `$lib/utils` to conditionally compose class strings.
- Prefer semantic HTML elements and utility classes over custom class names.
- Avoid inline `<style>` unless theming or scoped overrides are required.

UI Conventions
- Use pre-built Shadcn components from `$lib/components/ui` when applicable.
- Follow `bg-primary`, `text-primary-foreground`, `border`, `ring`, and `--color-var` naming conventions for consistent design.
- Design responsively using Tailwind’s mobile-first breakpoints.
- Use Svelte transitions and animations sparingly and with purpose.

Data & State
- Prefer reactive statements and runes over stores unless shared/global state is needed.
- Use helper modules for encapsulating business logic or API interactions.
- For form validation or schema logic, use `zod`.

Routing and API
- Use SvelteKit’s file-based routing under `src/routes`.
- Define endpoints with clear REST semantics inside `+server.ts` files.
- Implement form actions using `+page.server.ts` where appropriate.
- Use SSR and SSG features as needed. Default to SSR unless specific static prerendering is beneficial.

Testing
- Write unit tests using `Vitest`.
- Place test files next to their source file as `[component].test.ts` when possible.
- Use Playwright for E2E tests inside `tests/` or colocated in `src/routes`.

Performance
- Lazy-load components using dynamic imports for non-critical UI.
- Optimize image assets and icons; use SVG components or iconify sets.
- Use `$effect.tracking()` to reduce over-reactions where necessary.
- Use `{#key}` to manually trigger remounts when optimizing state resets.

Accessibility
- Ensure keyboard navigation support for all modals, menus, and buttons.
- Use `aria-*` attributes and `role` for custom UI elements.
- Avoid non-semantic containers (e.g., `div` as button) unless absolutely necessary.

General Conventions
1. Use early returns in functions to avoid nesting.
2. Keep function and variable names descriptive, especially in `load()` and `actions`.
3. Use semantic markup and minimal JS to keep the bundle lean.
4. Follow Prettier and ESLint rules (assumed via script: `lint`).
5. Use environment variables via `$env/static/private` and `$env/static/public`.

Refer to the SvelteKit, Tailwind, and Vitest documentation for best practices and examples.