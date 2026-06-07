# BS02: What Is Hippotherapy Section Management

## User Story
**As a** Victory Center admin
**I want** to manage the "What is Hippotherapy" section content
**So that** visitors understand the therapeutic approach and its benefits

## Business Value
This section educates visitors about hippotherapy as a therapeutic method. Admin control enables:
- Updating educational content based on latest research
- Tailoring messaging to different audience segments
- Maintaining accurate, professional descriptions

## Acceptance Criteria
- [ ] Admin can edit the section heading (up to 50 characters)
- [ ] Admin can edit the description with rich text formatting (up to 1000 characters)
- [ ] Rich text editor supports bold, italic, and link insertion
- [ ] Character counter updates in real-time as admin types
- [ ] System validates minimum 5 characters for heading, 10 for description
- [ ] Changes are not saved until admin clicks "Publish"
- [ ] Published content appears on the public hippotherapy page

## Sprint Demo Scenario
**Setup**: Admin is logged in and viewing the Hippotherapy admin page

**Demo Flow**:
1. Scroll to "What is Hippotherapy" section
2. Edit the heading to "Understanding Hippotherapy"
3. Update the description using rich text: bold key terms, add a research link
4. Show character counter: "542/1000"
5. Leave a field empty temporarily - observe validation error on blur
6. Fill in the field correctly - error disappears
7. Click "Publish" - success notification appears
8. View public page showing the formatted description with bold text and clickable link

## Test Scenarios

### Scenario 1: Happy Path - Edit Section with Rich Text
**Given** admin is on the Hippotherapy admin page
**When** admin updates the heading and description with bold/italic/link formatting
**And** admin clicks "Publish"
**Then** changes are saved successfully
**And** public page displays the formatted content correctly

### Scenario 2: Validation - Description Too Short
**Given** admin is editing the description field
**When** admin enters "Brief text" (10 characters) and clicks outside field
**Then** error message appears "Minimum 10 characters"
**And** Publish button remains disabled

### Scenario 3: Rich Text Formatting
**Given** admin is editing the description
**When** admin selects text and clicks "Bold" (or presses Ctrl+B)
**Then** selected text becomes bold in the editor
**And** character count includes formatting markup
**And** public page renders the bold text correctly

### Scenario 4: Link Insertion
**Given** admin is editing the description
**When** admin selects text, clicks "Insert Link", and enters a URL
**Then** text becomes a clickable link in the editor
**And** public page shows the hyperlink correctly

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h - already done)
- TS09: What Is Hippotherapy section component (4h)
- TS16: Text input field with rich text support (8h)
- TS22: Hippotherapy API service (shared) (0h - already done)
- TS30: Section integration tests (2h)

**Total Effort**: 14 hours

## Sprint Goal
Admin can manage the "What is Hippotherapy" educational section with full rich text editing capabilities. Content is validated and published to the public site with proper formatting.

## Dependencies
- BS01 (foundation work must be complete)
