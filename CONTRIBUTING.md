# 🏷️ Labeling & Issue Strategy

To keep our issue tracker clean, scalable, and contributor-friendly, we follow a strict labeling strategy and naming convention.  
Please read this guide **before creating a new issue or pull request**.

---

## 1. Issue Naming Convention

We use **scoped titles** to immediately identify the affected part of the application without introducing page-specific labels.

### Format

`[Scope] Short description of the task`

### Scope Rules

- **Scope** must match a **real feature, module, or UI component name** used in the codebase.
- Use **PascalCase** for scopes.
- Use **CAPS** for technical acronyms (API, SEO, FAQ).
- Avoid inventing new or ambiguous scopes.

### Composite Scope (when necessary)

For cross-cutting concerns, a composite scope is allowed:  
`[ScopeA][ScopeB] Short description`

Rules:

- Maximum **two scopes**
- Use only when the task truly affects multiple areas

### Examples

- ✅ `[Donation] Fix validation error on input`
- ✅ `[Partners] Align logos on mobile`
- ✅ `[API] Handle 500 error gracefully`
- ✅ `[Header] Update navigation links`

---

## 2. Label Taxonomy

We use a **Scoped Label System** (`prefix: value`).  
Each issue should ideally contain:

- **1× type**
- **1× priority**
- **1× area**
- **1× layer**
- **0–2× status**

---

### 🟦 Type: What kind of work is this?

| Label                                                                      | Description                                          |
| :------------------------------------------------------------------------- | :--------------------------------------------------- |
| ![type: feature](https://img.shields.io/badge/type-feature-a2eeef)         | New functionality                                    |
| ![type: enhancement](https://img.shields.io/badge/type-enhancement-254a9a) | Enhancement                                          |
| ![type: bug](https://img.shields.io/badge/type-bug-d73a4a)                 | Something is not working as expected                 |
| ![type: refactor](https://img.shields.io/badge/type-refactor-727b2d)       | Code cleanup without behavior changes                |
| ![type: debt](https://img.shields.io/badge/type-debt-5319e7)               | Planned technical debt or architectural improvements |
| ![type: poc](https://img.shields.io/badge/type-poc-6f42c1)                 | Proof of Concept or experiment                       |
| ![type: hotfix](https://img.shields.io/badge/type-hotfix-cfd3d7)           | Urgent production fix                                |

### 🟥 Priority: When do we need this?

| Label                                                                        | Description                   |
| :--------------------------------------------------------------------------- | :---------------------------- |
| ![priority: critical](https://img.shields.io/badge/priority-critical-b60205) | Blocks development or release |
| ![priority: high](https://img.shields.io/badge/priority-high-d93f0b)         | Important for current sprint  |
| ![priority: medium](https://img.shields.io/badge/priority-medium-fbca04)     | Normal priority               |
| ![priority: low](https://img.shields.io/badge/priority-low-fef2c0)           | Nice to have                  |

### 🟨 Area: Where is this located?

| Label                                                            | Description         |
| :--------------------------------------------------------------- | :------------------ |
| ![area: public](https://img.shields.io/badge/area-public-c5def5) | Client-facing pages |
| ![area: admin](https://img.shields.io/badge/area-admin-bfdadc)   | Admin dashboard     |
| ![area: api](https://img.shields.io/badge/area-api-dd16e6)       | API layer           |
| ![area: l10n](https://img.shields.io/badge/area-l10n-fbca04)     | Localization        |
| ![area: infra](https://img.shields.io/badge/area-infra-000000)   | Tooling & CI/CD     |

### ⬛ Status — Workflow State

| Label                                                                                           | Description     |
| ----------------------------------------------------------------------------------------------- | --------------- |
| ![status: blocked](https://img.shields.io/badge/status-blocked-000000)                          | Cannot proceed  |
| ![status: needs-design](https://img.shields.io/badge/status-needs--design-e99695)               | Requires design |
| ![status: needs-clarification](https://img.shields.io/badge/status-needs--clarification-cccccc) | Missing context |

### 🟪 Layer: Which application layer is affected?

| Label                                                                    | Description                                 |
| :----------------------------------------------------------------------- | :------------------------------------------ |
| ![layer: frontend](https://img.shields.io/badge/layer-frontend-0e8a16)   | Frontend codebase (UI, state, client logic) |
| ![layer: backend](https://img.shields.io/badge/layer-backend-5319e7)     | Backend services, APIs, business logic      |
| ![layer: fullstack](https://img.shields.io/badge/layer-fullstack-1d76db) | Changes affecting both frontend and backend |

---

## 3. Definition of Done

An issue is considered **done** when:

- Acceptance criteria are met
- No linting or type errors
- UI changes are responsive (mobile + desktop)
- No regressions introduced

---

## 4. Quick Tips for Contributors

- Responsive behavior is expected by default.
- UI Kit changes should prioritize consistency and reusability.
