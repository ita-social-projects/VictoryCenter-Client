# BS10: Principles Section Management

## User Story
**As a** Victory Center admin
**I want** to manage the principles section with heading, 5 principle descriptions, and an image
**So that** visitors understand the core values guiding the hippotherapy program

## Business Value
This section communicates the center's philosophy and values. Admin control enables:
- Articulating the guiding principles of care
- Updating content as the approach evolves
- Showcasing a visual representation of principles in action
- Building trust through transparency about values

## Acceptance Criteria
- [ ] Admin can edit section heading (up to 50 characters)
- [ ] Admin can edit 5 principle descriptions (up to 300 characters each)
- [ ] Admin can upload a principles image (minimum 1440×800 pixels)
- [ ] Admin can delete uploaded image and revert to default
- [ ] Each description field has a character counter
- [ ] System validates all text fields and image
- [ ] Changes require publication via "Publish" button
- [ ] Published principles appear on public page

## Sprint Demo Scenario
**Demo Flow**:
1. Navigate to "Principles" section
2. Edit heading to "Our Core Principles"
3. Edit 5 principle descriptions:
   - Principle 1: "Individual-centered approach tailored to each client"
   - Principle 2: "Evidence-based therapeutic methods"
   - Principle 3: "Collaboration between therapists and families"
   - Principle 4: "Safe, supportive environment for all"
   - Principle 5: "Continuous assessment and adaptation"
4. Upload image showing principles in practice
5. Show character counters for each principle
6. Publish changes
7. Public page displays all 5 principles with supporting image

## Test Scenarios

### Scenario 1: Happy Path - Edit All Principles
**Given** admin is on the Hippotherapy admin page
**When** admin edits heading, all 5 descriptions, and uploads image
**And** clicks "Publish"
**Then** changes save successfully
**And** public page shows complete principles section

### Scenario 2: Validation - One Principle Invalid
**Given** admin is editing principles
**When** Principles 1-4 are valid but Principle 5 is too short
**Then** Principle 5 shows error "Minimum 10 characters"
**And** Publish button is disabled

### Scenario 3: Character Counter Per Principle
**Given** admin is editing Principle 3
**When** admin types text
**Then** only Principle 3 counter updates: "87/300"
**And** other principles' counters remain unchanged

### Scenario 4: Image Upload with Principles
**Given** admin has edited text content
**When** admin uploads a valid principles image
**Then** image appears in preview
**And** Publish button becomes enabled (content changed)

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h)
- TS19: Principles section component (6h)
- TS15: Image upload field component (shared) (0h)
- TS16: Text input field component (shared) (0h)
- TS22: Hippotherapy API service (shared) (0h)
- TS38: Principles integration tests (3h)

**Total Effort**: 9 hours

## Sprint Goal
Admin can manage the principles section with heading, 5 principle descriptions, and an image, communicating the center's core values to visitors.

## Dependencies
- BS01 (foundation and shared components)
