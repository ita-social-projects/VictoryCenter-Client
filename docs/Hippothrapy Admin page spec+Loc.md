# Victory Center — Hippotherapy Admin Page
## Technical Specification for Claude Code

---

## 1. PROJECT CONTEXT

### Repositories
- **Client repo:** https://github.com/ita-social-projects/VictoryCenter-Client
- **Back repo:** https://github.com/ita-social-projects/VictoryCenter-Back

### Tech Stack
- React 19 + TypeScript 4.9
- SCSS (custom styles, no UI libraries)
- react-router-dom v7
- Create React App (react-scripts 5)

### Existing Project Structure
```
src/
├── assets/
├── components/        # Reusable UI components
├── const/routes/
├── layouts/main-layout/
├── pages/
│   ├── admin/         # ← TARGET: admin page goes here
│   └── user-pages/
│       ├── home-page/
│       ├── page-1/
│       └── page-2/
├── routes/app-router/
├── hooks/
├── context/admin-context-provider/
├── services/
│   └── data-fetch/
│       ├── admin-page-data-fetch/
│       └── user-pages-data-fetch/
└── utils/mock-data/
```

---

## 2. TASK

Implement the admin page for editing the **"Hippotherapy"** public page.
Place all files under `src/pages/admin/hippotherapy/`.

**Figma mockups:**
- Default admin page: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=23699-17654
- With localization: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22841-17329

---

## 3. PAGE SECTIONS

Each section is a separate component. Sections appear in this order on the page.

| # | Section name | Fields |
|---|---|---|
| 1 | Title | Зaголовок (50), Опис (300), image  |
| 2 | What is Hippotherapy |  Зaголовок (50), Опис (1000) |
| 3 | Testimonials | Опис (100), Додатковий Опис (50), Image |
| 4 | What is Ipoventia | Зaголовок (50), Опис (1000) |
| 5 | Center of Ipoventia | Зaголовок (50), Опис (300), Додатковий Опис (50), Image |
| 6 | Why This Approach | Зaголовок (50), Cards (image + Опис (300) |
| 7 | What the Approach Shows | Зaголовок (50), Опис (1000) |
| 8 | Scientific Research | Зaголовок (50), Опис (300), References list |
| 9 | Testimonials | Опис (100), Додатковий Опис (50), Image |
| 10 | Who the Programs Suit | Зaголовок (50), Cards (image + Опис (300) |
| 11 | Principles | Зaголовок (50), Опис (300), Опис (300), Опис (300), Опис (300), Опис (300), Image |

---

## 4. COMPONENTS TO IMPLEMENT

### 4.1 TextInputField (reusable)
```
Props:
  - value: string
  - maxLength: number
  - label: string
  - required: boolean
  - onChange: (value: string) => void
  - onBlur: () => void

Behavior:
  - Display live character counter: "14/50" (used/maximum)
  - Counter updates in real time on every keystroke
  - Block further input once maxLength is reached
  - Show clean-up icon (×) when field is not empty and focused
  - On × click: clear the field, kepp focus on the field, hide the icon
  - Space management: trim leading spaces, prevent double spaces inside text
  - Rich-text toolbar: Bold (Ctrl+B), Italic (Ctrl+I), Insert Link
  - Validation triggers on blur (focus lost)
  - Automatically expand text input field vertically to display the full content if text area exceeds the available visible space.No internal scrollbar shall be displayed within the field
  - The field height shall dynamically adjust as the user types, ensuring all entered text remains visible without requiring scrolling inside the input area
```

### 4.2 ImageUploadField (reusable)
```
Props:
  - currentImage: string | null   (URL of uploaded image, or null if showing default)
  - defaultImage: string          (URL of the default/fallback image)
  - recommendedSize: { width: number, height: number }
  - onUpload: (file: File) => void
  - onDelete: () => void

Behavior:
  - If no image uploaded: show the default image (non-deletable)
  - On hover over an uploaded image: show Delete, Crop icons
  - On Delete click: show confirmation pop-up "Видалити фото?" (Delete photo?)
    → НІ (No): close pop-up, no changes
    → ТАК (Yes): close pop-up, delete image, revert to the default image
  - Default image: Delete icon is NOT shown — admin cannot delete it
  - Upload methods: click the section to open file dialog OR drag & drop a file
  - File validation (before upload):
    * Size > 5 MB → error: "Зображення не більше 5 Mb"
    * Format not in jpeg, jpg, png, webp → error: "Невірний формат фото, дозволено jpeg, jpg, png, webp"
    * Pixel dimensions smaller than recommended → error: "Дозволено розмір картинки не менше рекомендованого"
  - On validation pass: apply Cropper before saving
    Cropper docs: https://github.com/ita-social-projects/VictoryCenter-Back/wiki/Cropper
  - On successful upload: enable the "Опублікувати" (Publish) button
```

**Recommended image sizes per section:**
| Section | Size (px) |
|---|---|
| Title (hero) | 1440×660 |
| Center of Ipoventia | 1440×420 |
| Testimonials | 1400×800 |
| Why This Approach (cards) | 360×430 |
| Principles | 1440×800 |

### 4.3 ScientificReferencesSection
```
Each entry (reference pair) contains:
  - Name (Назва): text input, required, Char(150), counter 0/150
  - Link (Посилання): text input, required, Char(1000), counter 0/1000

Entry states:
  A. Collapsed (default on page load):
     - Shows the entry title (name value, or "New entry" if empty)
     - Expand button ▼
     - Delete icon: visible if list has more than 1 entry; hidden if this is the last entry

  B. Expanded:
     - Shows Name + Link field
     - Collapse button ×
     - Delete icon: same visibility rule as above

"Додати +" button (always shown below the list):
  - Active: when all existing entries have passed validation
  - Disabled: when a new entry exists with empty/invalid fields
  - On click:
    * Append a new empty entry at the bottom in expanded state
    * Show empty fields with counters 0/150 and 0/1000
    * Button becomes disabled immediately
    * Becomes active again once the new entry passes validation

Delete entry flow:
  - Click Delete icon → confirmation pop-up "Видалити наукове дослідження?" (Delete research?)
    → НІ (No): close pop-up
    → ТАК (Yes): remove entry from list; if only 1 entry remains, hide its Delete icon

Fields in expanded state follow the same rules as TextInputField:
  character counter, space management, clean-up icon, validation on blur.
  Collapsing and re-expanding does NOT reset entered data.
```

### 4.4 PublishButton (global)
```
States:
  - Disabled: on page load (even if content is present)
  - Disabled: while no fields have been changed
  - Active: after any field change AND all changed fields pass validation

On click (Active state only):
  1. Show confirmation pop-up "Опублікувати зміни?" (Publish changes?)
     → НІ (No): close pop-up
     → ТАК (Yes):
       * Close pop-up
       * Save changes via API (PUT /api/hippotherapy or relevant endpoint)
       * Show success snack-bar "Зміни успішно опубліковано" (Changes published successfully)
       * Success snack-bar auto-closes after 3 seconds
       * Button returns to Disabled state
       * Public page displays the updated content
```

---

## 5. VALIDATION RULES (global)

Applied to all text fields. Validation fires **on blur** (when field loses focus).

| Field | Rule | Error message |
|---|---|---|
| Heading (Заголовок) | Required | "Поле обов'язкове" |
| Heading (Заголовок) | Min 5 characters | "Не менше 5 символів" |
| Description (Опис) | Required | "Поле обов'язкове" |
| Description (Опис) | Min 10 characters | "Не менше 10 символів" |
| Additional description (Додатковий опис) | Min 10 characters | "Не менше 10 символів" |
| Reference name (Назва) | Required | "Поле обов'язкове" |
| Reference name (Назва) | Min 5 characters | "Не менше 5 символів" |
| Reference link (Посилання) | Required | "Поле обов'язкове" |
| Reference link (Посилання) | Min 5 characters | "Не менше 5 символів" |

- Error message appears below the field after blur
- Error message disappears as soon as the field becomes valid (on change)
- "Опублікувати" button becomes active only when ALL changed fields are valid

---

## 6. SPACE MANAGEMENT

Reference: https://github.com/ita-social-projects/VictoryCenter-Back/wiki/Space-management

Apply this logic to all text input fields:
- Trim leading and trailing spaces on blur
- Prevent typing a space as the first character
- Replace two or more consecutive spaces with a single space
- Apply in real time (on change)

---

## 7. CLEAN-UP ICON

Reference: https://github.com/ita-social-projects/VictoryCenter-Back/wiki/Buttons-Behavoir#clean-up-icon

- The × (clear) icon appears inside the field when `value.length > 0` and on focuse
- On click: clear the field value, keep focus to the field
- Icon disappears when the field is empty

---

## 8. LOCALIZATION (mockup node-id=22841-17329)

### 8.1 Overview

Localization is implemented within the main Hippotherapy page
Each section on this page has a translation icons and indicators.

**Default language:** Ukrainian (UA) — edited on the main admin page.
**Translation language:** English (EN) — added via "Додати переклад" (Add translation) modals, and edited via "Редагувати переклад" (Edit translation) modals
Each section has its specified modals

**Key rule — Translation Gate (per section):**
- The translation icon for  sections is **disabled** until Ukrainian changes for the page have been published
- After Ukrainian content for a page is successfully published, the translation icons for each section becomes **active**


```
Translation icon states:
  disabled → UA changes for the page are unpublished
  active   → UA content for the page is published
```

---

### 8.2 TranslationIcon component (per section)

```
Props:
  - sectionId: string
  - isUkrainianPublished: boolean   // whether UA content for the section is published
  - hasTranslation: boolean         // whether an EN translation already exists
  - onOpen: () => void

States:
  - disabled: isUkrainianPublished === false
    → icon is greyed out, not clickable


  - active, no translation: isUkrainianPublished && !hasTranslation
    → icon is active, opens "Додати переклад" modal

  - active, has translation: isUkrainianPublished && hasTranslation
    → icon is active (different visual style — "edit"), opens "Редагувати переклад" modal
```

---

### 8.3 "Додати переклад" modal — base behavior (applies to ALL translation modals)

```
Header:
  - Title: "Додати переклад" (Add translation)
  - Language dropdown: active, contains only "Англійська" (English), selected by default
  - X button: active (closes the modal)

Footer:
  - "Зберегти переклад" (Save translation) button:
    → disabled on open
    → becomes active only when ALL required fields pass validation

Fields on open:
  - All fields are empty (do NOT pre-fill from UA values)
  - Character counter starts at: "0/50", "0/300", etc. (matching the field limit)
  - Same rules as main fields: space management, clean-up icon, validation on blur
  - Further input is blocked once maxLength is reached

X button behavior:
  - If no fields have been changed: close without confirmation
  - If any data has been entered: show confirmation "Закрити без збереження?"
    → НІ (No): return to modal
    → ТАК (Yes): close, entered data is discarded
```

---

### 8.4 Translation modal field configuration by section

#### Set #1: Title
Figma: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22841-18069

| Field | Type | Required | Char limit |
|---|---|---|---|
| Heading (Заголовок) | text input | Yes | 50 |
| Description (Опис) | text input | Yes | 300 |

---

#### Testimonials (Відгуки)
Figma: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22865-18614

| Field | Type | Required | Char limit |
|---|---|---|---|
| Description (Опис) | text input | Yes | 100 |
| Additional description (Додатковий опис) | text input | No | 50 |

---

#### What is Hippotherapy (Що таке іпотерапія), What is Ipoventia (Що таке іповенція), What the Approach Shows (Що показує досвід)
Figma: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=23759-17652&t=RfqLSdKcesRmqB9f-4

| Field | Type | Required | Char limit |
|---|---|---|---|
| Heading (Заголовок) | text input | Yes | 50 |
| Description (Опис) | text input | Yes | 1000 |


---

#### Center of Ipoventia (В центрі іповенції)
Figma: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22865-18673

| Field | Type | Required | Char limit |
|---|---|---|---|
| Heading (Заголовок) | text input | Yes | 50 |
| Description (Опис) | text input | Yes | 300 |
| Additional description (Додатковий опис) | text input | No | 50 |

#### Why This Approach, Who the Programs Suit
Figma: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22841-18158

| Field | Type | Required | Char limit | Note |
|---|---|---|---|---|
| Heading (Заголовок) | text input | Yes | 50 | |
| Description ×4 (Опис) | text input | Yes | 300 each | Each Description field is paired with the corresponding card image (image is disabled — for visual context only) |

```
Modal layout:
  - 1× Heading field (50)
  - 4× pairs of [image (disabled, from published UA) + Description field (300)]
  Images are read-only and shown only for context — they cannot be edited in this modal.
```

---

#### Scientific Research (Наукові дослідження) — TWO independent modals
Figma general block: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22841-18455
Figma research entry: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22841-18560

**Modal 1: Section general block**
| Field | Type | Required | Char limit |
|---|---|---|---|
| Heading (Заголовок) | text input | Yes | 50 |
| Description (Опис) | text input | Yes | 300 |

**Modal 2: Research entry title (per entry)**
| Field | Type | Required | Char limit |
|---|---|---|---|
| Name (Назва) | text input | Yes | 150 |

```
IMPORTANT: The two modals open INDEPENDENTLY:
  - Translation icon next to the section heading → opens Modal 1
  - Translation icon next to each individual research entry → opens Modal 2
  Each research entry in the list has its own translation icon.
```

---

#### Principles (Принципи)
Figma: https://www.figma.com/design/mZTSCb4NVC31facfhy6Gu1/Victory-Center-Admin-Panel?node-id=22945-18768

| Field | Type | Required | Char limit |
|---|---|---|---|
| Heading (Заголовок) | text input | Yes | 50 |
| Description ×5 (Опис) | text input | Yes | 300 each |

---

### 8.5 Save translation flow ("Зберегти переклад")

```
When admin clicks "Зберегти переклад" (active state only):
  1. Run final validation on all fields
  2. Call API:
     - New translation: POST /api/hippotherapy/translations/{locale}/{sectionId}
     - Existing translation: PUT /api/hippotherapy/translations/{locale}/{sectionId}
  3. On success:
     - Close modal
     - Update the section's TranslationIcon to "has translation" state
     - Show success toast "Переклад опубліковано" (Translation saved) — auto-close after 3 seconds
  4. On API error:
     - Show error toast "Помилка збереження. Спробуйте ще раз" (Save error. Please try again)
     - Keep modal open
```

---

### 8.6 Content localization map

| Content type | Example | Localized |
|---|---|---|
| Headings, descriptions, text | Section titles, body text | YES (separate per language) |
| Card text | Description below card image | YES (separate per language) |
| Research entry name (Назва) | Title of a research paper | YES (separate per language) |
| Research entry link (Посилання) | URL | NO (shared across languages) |
| Media / images | All section images | NO (shared across languages) |
| Structure | Section order, number of cards | NO (shared across languages) |

---

### 8.7 Translation state shape

```typescript
interface TranslationState {
  // Translation icon status per section
  sectionTranslationStatus: {
    [sectionId: string]: {
      isUkrainianPublished: boolean;
      hasEnglishTranslation: boolean;
      lastUkrainianPublishedAt: string | null;
    };
  };

  // Currently open translation modal (null if none open)
  activeTranslationModal: {
    sectionId: string;
    modalType:
      | 'set1'
      | 'testimonials'
      | 'centerIpoventia'
      | 'set2'
      | 'researchGeneral'
      | 'researchEntry'
      | 'principles';
    entryId?: string;  // only for researchEntry modal
    mode: 'add' | 'edit';
  } | null;

  // Saved translations keyed by sectionId → locale → field values
  translations: {
    [sectionId: string]: {
      [locale: string]: SectionTranslation;
    };
  };
}

interface SectionTranslation {
  locale: string;
  fields: Record<string, string>;  // fieldName → translated value
  savedAt: string | null;
}
```

---

### 8.8 Translation API endpoints

```
GET  /api/hippotherapy/translations/{locale}
  → Returns all translations for the page in the given locale

GET  /api/hippotherapy/translations/{locale}/{sectionId}
  → Returns translation for a specific section

POST /api/hippotherapy/translations/{locale}/{sectionId}
  → Save a new translation for a section

PUT  /api/hippotherapy/translations/{locale}/{sectionId}
  → Update an existing translation for a section

GET  /api/hippotherapy/translations/status
  → Returns sectionTranslationStatus for all sections
  → Used to determine the enabled/disabled state of translation icons
```

---

## 9. STATE MANAGEMENT

Use React Context (`admin-context-provider`) or local useState with state lifting.

```typescript
interface HippotherapyPageState {
  // Main UA form state
  isDirty: boolean;             // any unsaved changes exist
  isPublishEnabled: boolean;    // Publish button is active
  isLoading: boolean;
  errors: Record<string, string>; // fieldId → errorMessage
  content: HippotherapyContent;

  // Localization state
  translation: TranslationState; // defined in section 8.7
}

interface HippotherapyContent {
  title: { heading: string; description: string; };
  whatIsIpoventia: { heading: string; description: string; };
  centerOfIpoventia: {
    heading: string;
    description: string;
    additionalDescription: string;
    image: ImageData;
  };
  testimonials: { text: string; author: string; image: ImageData; };
  whatIsHippotherapy: { heading: string; description: string; };
  whyThisApproach: { heading: string; description: string; cards: Card[]; };
  whatApproachShows: { heading: string; description: string; };
  scientificResearch: {
    heading: string;
    description: string;
    references: Reference[];
  };
  whoPrograms: { heading: string; description: string; cards: Card[]; };
  principles: { heading: string; description: string; };
}

interface Reference {
  id: string;
  name: string;        // Char(150)
  link: string;        // Char(1000)
  isExpanded: boolean;
}

interface Card {
  id: string;
  image: ImageData;
  description: string;
}

interface ImageData {
  url: string | null;
  isDefault: boolean;
}
```

---

## 10. API ENDPOINTS

```
GET  /api/hippotherapy
  → Returns all page content (Ukrainian)

PUT  /api/hippotherapy
  → Saves and publishes page content changes (Ukrainian)

POST /api/hippotherapy/images
  → Uploads an image, returns the image URL

DELETE /api/hippotherapy/images/{imageId}
  → Deletes an image

GET  /api/hippotherapy/scientific-references
  → Returns list of research references

POST /api/hippotherapy/scientific-references
  → Add a new reference entry

PUT  /api/hippotherapy/scientific-references/{id}
  → Update a reference entry

DELETE /api/hippotherapy/scientific-references/{id}
  → Delete a reference entry
```

If the API is not yet implemented, use mock data from `src/utils/mock-data/` and leave `// TODO: replace with real API call` comments.

---

## 11. SHARED POP-UP COMPONENTS

### ConfirmationModal (reusable)
```
Props:
  - isOpen: boolean
  - title: string        // e.g. "Видалити фото?" / "Опублікувати зміни?" / "Видалити наукове дослідження?"
  - onConfirm: () => void
  - onCancel: () => void
  - confirmLabel: string  // "ТАК"
  - cancelLabel: string   // "НІ"
```

### SuccessToast (reusable)
```
Props:
  - message: string      // e.g. "Зміни успішно опубліковано" / "Переклад опубліковано"
  - autoCloseMs: number  // default: 3000

Behavior: auto-closes after autoCloseMs milliseconds
```

---

## 12. FILE STRUCTURE

```
src/pages/admin/hippotherapy/
├── HippotherapyAdminPage.tsx          # Main UA editing page
├── HippotherapyAdminPage.scss
├── HippotherapyLocalizationPage.tsx   # EN localization page (separate)
├── HippotherapyLocalizationPage.scss
├── index.ts
│
├── components/
│   ├── sections/
│   │   ├── TitleSection/
│   │   ├── WhatIsIpoventiaSection/
│   │   ├── CenterSection/
│   │   ├── TestimonialsSection/
│   │   ├── WhyThisApproachSection/
│   │   ├── WhatApproachShowsSection/
│   │   ├── ScientificReferencesSection/
│   │   │   ├── ScientificReferencesSection.tsx
│   │   │   ├── ReferenceEntry.tsx
│   │   │   └── ScientificReferencesSection.scss
│   │   ├── WhoSuitsProgramsSection/
│   │   └── PrinciplesSection/
│   │
│   ├── translation/
│   │   ├── TranslationIcon/
│   │   │   ├── TranslationIcon.tsx        # Icon with gate logic (disabled/active/edit states)
│   │   │   └── TranslationIcon.scss
│   │   └── modals/
│   │       ├── TranslationModalBase.tsx   # Base modal shell: header, language dropdown, footer
│   │       ├── Set1TranslationModal.tsx   # Heading + Description (sections: Title, WhatIs...)
│   │       ├── TestimonialsTranslationModal.tsx  # Description + Additional description
│   │       ├── CenterTranslationModal.tsx # Heading + Description + Additional description
│   │       ├── Set2TranslationModal.tsx   # Heading + 4× (image + Description)
│   │       ├── ResearchGeneralModal.tsx   # Heading + Description (section general block)
│   │       ├── ResearchEntryModal.tsx     # Name only (per individual research entry)
│   │       └── PrinciplesTranslationModal.tsx  # Heading + 5× Description
│   │
│   └── shared/
│       ├── TextInputField/
│       │   ├── TextInputField.tsx
│       │   └── TextInputField.scss
│       ├── ImageUploadField/
│       │   ├── ImageUploadField.tsx
│       │   └── ImageUploadField.scss
│       ├── PublishButton/
│       │   ├── PublishButton.tsx
│       │   └── PublishButton.scss
│       ├── ConfirmationModal/
│       │   ├── ConfirmationModal.tsx
│       │   └── ConfirmationModal.scss
│       └── SuccessToast/
│           ├── SuccessToast.tsx
│           └── SuccessToast.scss
│
├── hooks/
│   ├── useHippotherapyAdmin.ts    # Core page state and logic
│   ├── useTranslation.ts          # Translation gate logic + modal open/close
│   ├── useImageUpload.ts          # Image upload, validation, cropper
│   └── useFormValidation.ts       # Validation rules and error state
│
├── services/
│   ├── hippotherapyAdminService.ts        # API calls for main page content
│   └── hippotherapyTranslationService.ts  # API calls for translations
│
├── types/
│   └── hippotherapy.types.ts      # All interfaces from sections 9 and 8.7
│
└── utils/
    ├── validation.ts              # Pure validation functions
    └── spaceManagement.ts         # Space management utilities
```

---

## 13. STARTER PROMPT FOR CLAUDE CODE

Place `CLAUDE_CODE_SPEC.md` in the project root, then paste this into Claude Code:

```
Read the file CLAUDE_CODE_SPEC.md in full before starting any work.

Task: Implement the Hippotherapy admin page for the VictoryCenter-Client project.

Step 1 — Explore the existing codebase first:
- src/pages/admin/           → what admin pages already exist
- src/components/            → which components can be reused
- src/context/admin-context-provider/  → how context is structured
- src/services/data-fetch/admin-page-data-fetch/  → service patterns in use
- src/utils/mock-data/       → which mock data already exists

Step 2 — Implement in the following order. Do one step at a time and wait for confirmation before proceeding:

1.  types/hippotherapy.types.ts
    → All interfaces from spec sections 9 and 8.7

2.  utils/spaceManagement.ts + utils/validation.ts
    → Pure utility functions, fully unit-testable

3.  shared/TextInputField
    → Character counter, validation on blur, clean-up icon, space management, rich-text toolbar

4.  shared/ImageUploadField
    → Click-to-upload + drag & drop, file validation (size/format/pixel dimensions), default image, cropper

5.  shared/ConfirmationModal + shared/SuccessToast
    → Reusable pop-ups used across the page

6.  services/hippotherapyAdminService.ts
    → With mock data fallback; add // TODO comments where the real endpoint is unknown

7.  hooks/useHippotherapyAdmin.ts
    → Page state, dirty tracking, publish flow

8.  Section components (simplest first):
    TitleSection → WhatIsIpoventiaSection → CenterSection → TestimonialsSection
    → WhyThisApproachSection → WhatApproachShowsSection → WhoSuitsProgramsSection
    → PrinciplesSection → ScientificReferencesSection (most complex — do last)

9.  HippotherapyAdminPage.tsx
    → Assembles all sections + PublishButton; full publish confirmation flow

10. TranslationIcon component + useTranslation hook
    → Gate logic: disabled/active per section based on UA publish status

11. Translation modals (in order):
    TranslationModalBase → Set1TranslationModal → TestimonialsTranslationModal
    → CenterTranslationModal → Set2TranslationModal
    → ResearchGeneralModal + ResearchEntryModal → PrinciplesTranslationModal

12. HippotherapyLocalizationPage.tsx + hippotherapyTranslationService.ts
    → Assembles the localization scroll page with all TranslationIcons

Style rules:
  - SCSS with BEM-like naming convention
  - No UI libraries — custom styles only, matching the existing project
  - Do NOT invent API endpoint names — use mock data and leave TODO comments
  - Do NOT move to the next step until the current one is confirmed
```
