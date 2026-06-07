# BS12: Translation System for English Content

## User Story
**As a** Victory Center admin
**I want** to translate each section to English after publishing Ukrainian content
**So that** English-speaking visitors can access the hippotherapy page in their language

## Business Value
Multilingual support expands the center's reach to international audiences. Translation system provides:
- Access for English-speaking families and donors
- Professional, localized content for each language
- Control over what content is translated and when
- Prevention of incomplete translations reaching public site

## Acceptance Criteria
- [ ] Each section has a translation icon (globe or language icon)
- [ ] Translation icon is disabled until Ukrainian content is published
- [ ] After Ukrainian publication, translation icon becomes active
- [ ] Clicking translation icon opens a modal specific to that section type
- [ ] Modal has:
  - Title "Add Translation" (if no translation) or "Edit Translation" (if exists)
  - Language dropdown (English selected, disabled for now)
  - Fields matching the section structure (no images - they're shared)
  - "Save Translation" button (disabled until all required fields are valid)
  - X button to close (with confirmation if data entered)
- [ ] 8 different modal variants for different section types:
  - Set 1: Title, What Is Hippotherapy, What Is Ipoventia, What the Approach Shows (heading + description)
  - Testimonials: description + additional description
  - Center of Ipoventia: heading + description + additional description
  - Why This Approach / Who Programs Suit: heading + 4 descriptions (with readonly images for context)
  - Scientific Research (general): heading + description
  - Scientific Research (per entry): name only
  - Principles: heading + 5 descriptions
- [ ] Fields start empty (do not pre-fill from Ukrainian)
- [ ] Character counters match Ukrainian field limits
- [ ] Validation rules match Ukrainian fields
- [ ] Saving translation:
  - Calls API to save translation
  - Shows success toast "Translation saved"
  - Updates icon to "edit translation" state
  - Closes modal
- [ ] Published translations appear on English public page (`/en/hippotherapy`)
- [ ] Images and structure are shared between languages (only text is translated)

## Sprint Demo Scenario
**Demo Flow**:
1. Admin is on Hippotherapy admin page (Ukrainian content published)
2. Show translation icons next to each section - all are disabled (greyed out)
3. Edit Title section heading, publish changes
4. Title section's translation icon becomes active (other sections stay disabled until their content is published)
5. Click translation icon for Title section
6. "Add Translation" modal opens with:
   - Language dropdown: "English" (disabled)
   - Heading field: empty, counter "0/50"
   - Description field: empty, counter "0/300"
   - "Save Translation" button: disabled
7. Fill in heading: "Hippotherapy at Victory Center"
8. Fill in description: "Discover how therapeutic horseback riding can improve physical, emotional, and cognitive development."
9. "Save Translation" button enables
10. Click "Save Translation"
11. Success toast appears "Translation saved"
12. Modal closes
13. Translation icon changes appearance (now shows "edit" state)
14. Click translation icon again - "Edit Translation" modal opens with saved content
15. Navigate to `/en/hippotherapy` on public site - English title section displays
16. Return to admin, open Scientific Research section translation
17. Show that each research entry has its own translation icon
18. Translate the section heading/description (one modal)
19. Translate individual research entry (separate modal, name only)
20. Publish all translations
21. Public English page shows complete scientific research section

## Test Scenarios

### Scenario 1: Translation Gate - Ukrainian Not Published
**Given** admin has edited Title section but not published
**When** admin views the Title section
**Then** translation icon is disabled (greyed out)
**And** clicking icon does nothing

### Scenario 2: Translation Gate - Ukrainian Published
**Given** admin has published Title section in Ukrainian
**When** admin views the Title section
**Then** translation icon becomes active (colored, clickable)
**When** admin clicks the icon
**Then** "Add Translation" modal opens

### Scenario 3: Add Translation - Happy Path
**Given** "Add Translation" modal is open for Title section
**When** admin fills in all required fields with valid content
**And** clicks "Save Translation"
**Then** API saves the translation
**And** success toast appears
**And** modal closes
**And** translation icon changes to "edit" state

### Scenario 4: Add Translation - Validation Error
**Given** "Add Translation" modal is open
**When** admin enters heading with only 3 characters
**And** clicks outside the field (blur)
**Then** error appears "Minimum 5 characters"
**And** "Save Translation" button is disabled

### Scenario 5: Edit Translation - Modify Existing
**Given** Title section has an English translation
**When** admin clicks translation icon
**Then** "Edit Translation" modal opens with existing content
**When** admin modifies the heading
**And** clicks "Save Translation"
**Then** API updates the translation
**And** success toast appears
**And** public English page shows updated content

### Scenario 6: Modal Close Confirmation - Unsaved Changes
**Given** admin has opened translation modal and entered some text
**When** admin clicks X to close
**Then** confirmation modal appears "Close without saving?"
**When** admin clicks "No"
**Then** returns to translation modal with data intact
**When** admin clicks "Yes"
**Then** modal closes and entered data is discarded

### Scenario 7: Modal Close - No Changes
**Given** admin has opened translation modal but not entered any text
**When** admin clicks X to close
**Then** modal closes immediately (no confirmation)

### Scenario 8: Scientific Research - Two Independent Modals
**Given** Scientific Research section is translated
**When** admin clicks translation icon next to section heading
**Then** modal opens with heading + description fields
**When** admin saves and closes
**And** clicks translation icon next to a specific research entry
**Then** different modal opens with name field only
**And** link field is not present (URLs are shared across languages)

### Scenario 9: Card Sections - Images for Context
**Given** "Why This Approach" section translation modal is open
**When** modal displays
**Then** 4 card images appear (readonly, from Ukrainian version)
**And** 4 description fields appear (editable)
**And** images cannot be changed in this modal
**And** images provide visual context for what each description refers to

### Scenario 10: Translation API Error
**Given** admin has filled translation modal correctly
**When** admin clicks "Save Translation"
**And** API returns an error
**Then** error toast appears "Failed to save translation. Please try again."
**And** modal remains open with data intact
**And** admin can retry

## Technical Implementation
This business story is implemented by:
- TS02: Translation types and constants (4h)
- TS03: Translation service (5h)
- TS06: Translation icon component (3h)
- TS07: Translation modal base component (4h)
- TS25: Set1 translation modal (Title, What Is...) (3h)
- TS26: Testimonials translation modal (3h)
- TS27: Center of Ipoventia translation modal (3h)
- TS28: Card sections translation modal (Why/Who) (4h)
- TS40: Scientific Research general translation modal (3h)
- TS41: Scientific Research entry translation modal (2h)
- TS42: Principles translation modal (3h)
- TS43: useTranslationGate hook (4h)
- TS44: useTranslationModal hook (4h)
- TS45: Translation integration tests (6h)

**Total Effort**: 51 hours

## Sprint Goal
Complete translation system allowing admin to translate all hippotherapy sections to English after publishing Ukrainian content, with validation, modal variants, and translation gate logic.

## Dependencies
- BS11 (main page must be functional)
- All sections BS01-BS10 (each section needs its translation modal)
