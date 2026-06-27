---
name: victory-center-pr-review
description: Full PR review workflow — analyze changed files, apply review checklists, fix issues, run typecheck/lint, manage tests and code smells
invoked-by: manual
allowed-tools:
  - Read
  - Glob
  - Grep
  - Bash
  - Edit
  - Write
  - Agent
---

# Victory Center PR Review Skill

End-to-end workflow for reviewing and fixing any branch before it ships.
Covers: diff analysis → multi-category review → fixes → lint/typecheck → tests → code smells → commits.

## How to Use

**Invocation**: `/victory-center-pr-review [base-branch]`

**Examples**:
- `/victory-center-pr-review main`
- `/victory-center-pr-review release/1.0.0`
- `/victory-center-pr-review issue-123`

---

## Phase 1: Analysis (always use Plan Mode)

### 1.1 Enumerate changed files

```bash
git diff <base>...HEAD --name-only   # all files changed vs base
git log <base>..HEAD --oneline       # commits on branch
```

### 1.2 Explore in parallel

Launch up to 3 Explore sub-agents simultaneously to read changed files in full — smells hide in context:
- **Agent 1**: page components, hooks, contexts
- **Agent 2**: API services, types, validation schemas
- **Agent 3**: tests, constants, config files

### 1.3 Apply review checklists

While reading files, flag issues against all five categories below.

#### A. React correctness
- [ ] No mutations in render body (arrays/sets mutated outside useMemo/useCallback)
- [ ] No conditional or loop-level hook calls (violates Rules of Hooks)
- [ ] `useEffect` has cleanup for subscriptions, timers, and async operations
- [ ] Dependency arrays are complete — no stale closures
- [ ] Derived values are computed, not stored in state
- [ ] Derived arrays/objects passed as hook deps are memoized
- [ ] Inline object/array literals NOT passed directly as hook deps (new ref every render)
- [ ] No index as React `key` in dynamic lists
- [ ] Async `useEffect` uses AbortController or isMounted guard

#### B. TypeScript correctness
- [ ] No `any` in new code — use `unknown` if the type is genuinely dynamic
- [ ] No excessive `as` casts that hide real type errors
- [ ] Exported functions have explicit return types
- [ ] Props interfaces are explicit — no `Function` type, no `object` without shape
- [ ] Optional chaining used where value may be null/undefined (not assumed defined)
- [ ] Enum values used from the enum type, not raw strings

#### C. Architecture & project patterns
- [ ] **Public API functions**: accept `options: RequestOptions` and forward `options.cancellationSignal` to axios
- [ ] **Admin API services**: object with static methods, first param is `client: AxiosInstance`
- [ ] **Data fetching**: uses `useDataFetch` hook — not raw `useEffect` + axios
- [ ] **`useGetLocalization`**: fallback object is stable (wrapped in `useMemo`) — never an inline literal
- [ ] **Forms**: use `useFormManager` hook — not raw `useForm` directly
- [ ] **Constants**: extracted to `src/const/[admin|public|common]/` — not inline in components
- [ ] **Types**: in `src/types/[admin|public|common]/` — never co-located with constants
- [ ] **Validation schemas**: in `src/validation/admin/` with `DOMAIN_VALIDATION_FUNCTIONS` export
- [ ] **Path aliases**: `@/` everywhere — no `../../` relative paths
- [ ] **Styles**: SCSS modules only — no inline `style={{}}` objects
- [ ] **Images**: imported in const files, not directly in components

#### D. Accessibility
- [ ] Interactive non-button elements have `role`, `tabIndex`, and `onKeyDown` (Enter/Space)
- [ ] All `<img>` elements have meaningful `alt` text (not empty unless decorative)
- [ ] Form inputs have associated `<label>` elements
- [ ] Color is not the only visual indicator of state
- [ ] Heading hierarchy is logical (no skipping h1→h3)
- [ ] Modals/dialogs trap focus and restore it on close

#### E. Security
- [ ] No `dangerouslySetInnerHTML` with unsanitized user input — check `normalize-html.ts` is used
- [ ] URLs in `href`/`src` from user data are validated/sanitized (no `javascript:` protocol)
- [ ] No sensitive data (tokens, passwords) stored in localStorage beyond what auth already does
- [ ] No API secrets or credentials in frontend code

### 1.4 Categorize issues in the plan

| Tier | Label | Examples |
|------|-------|---------|
| 🔴 | **Critical** — correctness | render mutations, stale closures, broken memo deps, missing AbortSignal |
| 🟠 | **Moderate** — maintainability | inline object deps, index keys, missing project pattern, duplicated constants |
| 🟡 | **Minor** — style/clarity | nested ternaries, redundant casts, unnecessary imports, unclear naming |
| ⚪ | **Pre-existing** — out of scope | note but do not fix unless asked |

### 1.5 Fix order

1. Critical first — correctness blocks merge
2. Moderate second — reviewer will flag
3. Minor last — nice-to-have
4. Never touch pre-existing without explicit request

---

## Phase 2: TypeCheck + Lint

```bash
npm run lint          # ESLint + Prettier — confirm 0 errors, 0 warnings
npm run lint:fix      # auto-fix Prettier formatting issues
npm run lint          # re-run to verify clean
```

```bash
npx tsc --noEmit      # TypeScript type check (errors also surface during build)
```

**Note**: This project uses `react-scripts` + `craco`. Prettier formatting errors appear as ESLint `prettier/prettier` warnings — always auto-fixable via `lint:fix`.

---

## Phase 3: Tests

### 3.1 Test runner — ALWAYS use craco, never react-scripts directly

```bash
# Correct — resolves @/ path aliases
npx craco test --watchAll=false --forceExit

# Wrong — @/ aliases fail to resolve
npx react-scripts test --watchAll=false
```

### 3.2 Targeted test run (faster feedback)

```bash
npx craco test --watchAll=false --forceExit --testPathPattern="ComponentName|hookName|api-file"
```

### 3.3 Coverage threshold rule — ONLY RAISE, NEVER LOWER

```bash
npm run test:cover    # measure actual coverage
```

```js
// jest.config.js — after running test:cover, update ONLY if actual > current floor
coverageThreshold: {
  global: {
    statements: 94.1,   // floor — raise if actual is higher, never lower
    branches:   87.0,
    functions:  93.4,
    lines:      95.4,
  }
}
```

**Rule**: Round actual values **down** to 1 decimal. Never reduce a threshold — fix the tests instead.

### 3.4 Reviewing existing tests

Red flags:
- Tests that mock everything and assert nothing meaningful
- Missing edge cases: null/undefined data, empty arrays, error states
- Brittle selectors (`getByText` on translated strings that change)
- Auto-mocks that don't create `jest.fn()` — always use factory form

```ts
// Auto-mock (component functions won't be jest.fn())
jest.mock('@/components/public/cta');

// Factory mock — correct
jest.mock('@/components/public/cta', () => ({
  CtaSection: jest.fn(),
}));
```

### 3.5 Asserting on mocked components

React calls component functions with `(props, undefined)`. `toHaveBeenCalledWith` + `expect.anything()` fails because `expect.anything()` does not match `undefined`.

```ts
// Fails — second arg is undefined, not "anything"
expect(MockedComp).toHaveBeenCalledWith({ label: 'x' }, expect.anything());

// Correct
expect(MockedComp.mock.calls[0][0]).toEqual({ label: 'x' });
```

### 3.6 Mocking browser APIs

```ts
const mockObserver = { observe: jest.fn(), disconnect: jest.fn(), unobserve: jest.fn() };
global.IntersectionObserver = jest.fn(() => mockObserver) as any;
global.ResizeObserver = jest.fn(() => mockObserver) as any;
```

### 3.7 Adding new tests — checklist

For each untested component or hook:

1. **Mock external dependencies** — API calls, router, i18n (i18n auto-mocked in this project)
2. **Test render** — basic render without crashing
3. **Test content** — key translated strings appear (use locale JSON values directly)
4. **Test behavior** — user interactions, state changes, conditional rendering
5. **Test edge cases** — empty data, null images, undefined IDs, error states, loading states

```ts
describe('ComponentName', () => {
  it('renders without crashing', () => { ... });
  it('displays translated title', () => { ... });
  it('handles empty data gracefully', () => { ... });
  it('shows error state when API fails', () => { ... });
});
```

---

## Phase 4: Code Smell Detection

Start with automated checks:
```bash
npm run lint    # catches unused vars, missing deps, formatting
```

Then scan manually for the patterns below.

### 4.1 Render-safety smells — 🔴 Critical

**Mutable value created outside useMemo in render body:**

```tsx
// Mutates Set during render — breaks in React Concurrent Mode
const seen = new Set<string>();
const items = data.map(item => {
  const isFirst = !seen.has(item.id);
  seen.add(item.id);
  return { item, isFirst };
});

// Correct — move into useMemo
const items = useMemo(() => {
  const seen = new Set<string>();
  return data.map(item => {
    const isFirst = !seen.has(item.id);
    seen.add(item.id);
    return { item, isFirst };
  });
}, [data]);
```

### 4.2 useMemo / useCallback dependency smells — 🟠 Moderate

**Derived array not memoized — invalidates downstream memo on every render:**

```tsx
// New array ref every render → downstream useMemo recomputes every render (useless memo)
const sorted = [...data].sort((a, b) => a.order - b.order);
const processed = useMemo(() => sorted.map(transform), [sorted]);

// Correct
const sorted = useMemo(() => [...data].sort((a, b) => a.order - b.order), [data]);
const processed = useMemo(() => sorted.map(transform), [sorted]);
```

**Inline object/array as dependency:**

```tsx
// New object ref every render → hook's internal useMemo recomputes every render
const { title } = useGetLocalization(localizations, { title: content?.title });

// Correct — stabilize with useMemo
const fallback = useMemo(() => ({ title: content?.title }), [content?.title]);
const { title } = useGetLocalization(localizations, fallback);
```

### 4.3 API service smells — 🟠 Moderate

**Missing AbortSignal on public API functions — requests don't cancel on component unmount:**

```ts
// Signal ignored
getItems: async (): Promise<Item[]> => {
  const res = await axios.get(URL);
  return res.data;
}

// Correct — matches project pattern
getItems: async (options: RequestOptions): Promise<Item[]> => {
  const res = await axios.get(URL, { signal: options.cancellationSignal });
  return res.data;
}
```

**Admin API method missing `client` param:**

```ts
// Wrong — uses global singleton
getAll: async (): Promise<Item[]> => {
  const res = await axiosInstance.get(URL);
  return res.data;
}

// Correct — takes auth client as first param
getAll: async (client: AxiosInstance): Promise<Item[]> => {
  const res = await client.get(URL);
  return res.data;
}
```

### 4.4 Duplication smells — 🟠 Moderate

Constants or regex defined in more than one file → extract:
- Per-page constants: `src/const/public/<feature>-page.ts` or `src/const/admin/<feature>.ts`
- Shared constants: `src/const/common/`
- Types always in `src/types/` — never co-located with constants
- Image imports live in the const file alongside the constants that reference them

### 4.5 React key smells — 🟠 Moderate

```tsx
// Index as key — breaks reconciliation if list reorders or items are removed
{items.map((item, idx) => <div key={idx}>...)}

// Stable identity — use id, slug, or another unique field
{items.map(item => <div key={item.id}>...)}
```

### 4.6 TypeScript smells — 🟠 Moderate

```tsx
// `any` disables type checking — use `unknown` then narrow
const data: any = response;

// Unnecessary assertion — TypeScript already knows the type
ref={ref as React.RefObject<HTMLElement>}   // useRef<HTMLElement> already returns this

// Overly broad function type
interface Props { onClick: Function }
// Correct
interface Props { onClick: (event: React.MouseEvent<HTMLButtonElement>) => void }
```

### 4.7 Style / clarity smells — 🟡 Minor

**Nested ternaries** → Record map:

```tsx
// Hard to read and extend
const cls = x === 'a' ? styles.a : x === 'b' ? styles.b : styles.c;

// Clear and exhaustive
const CLASS_MAP: Record<typeof x, string> = { a: styles.a, b: styles.b, c: styles.c };
const cls = CLASS_MAP[x];
```

**Nested template literals in `className`** → extract variable:

```tsx
// Hard to read
className={`${styles.base} ${isActive ? `${styles.active} ${styles.extra}` : ''}`}

// Extract before JSX return
const cls = isActive
  ? `${styles.base} ${styles.active} ${styles.extra}`
  : styles.base;
// ...
className={cls}
```

---

## Phase 5: Commit Strategy

After all fixes pass lint + tests, group into logical commits:

1. `refactor: <describe the rename or extraction>` — no behavior change
2. `fix: <describe the bug>` — correctness issues
3. `test: add missing tests and update coverage thresholds` — test-only, always last

Rules:
- Never mix source fixes and test changes in the same commit
- Never commit `.claude/settings.local.json` or `NUL`
- Git detects renames automatically when staged together (delete + add)

---

## Quick Reference

| Task | Command |
|------|---------|
| List changed files | `git diff <base>...HEAD --name-only` |
| Run lint | `npm run lint` |
| Fix lint | `npm run lint:fix` |
| Run all tests | `npx craco test --watchAll=false --forceExit` |
| Run targeted tests | `npx craco test --watchAll=false --forceExit --testPathPattern="Name"` |
| Coverage report | `npm run test:cover` |
| TypeScript check | `npx tsc --noEmit` |
