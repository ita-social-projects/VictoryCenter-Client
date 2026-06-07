# BS09: Who Programs Suit Section Management

## User Story
**As a** Victory Center admin
**I want** to manage the "Who the Programs Suit" section with heading and 4 audience cards
**So that** visitors can determine if hippotherapy is appropriate for their needs

## Business Value
This section helps visitors self-qualify and understand program suitability. Admin control enables:
- Targeting specific audience segments (children, adults, conditions)
- Updating imagery to show diverse participants
- Refining descriptions based on program evolution
- Helping families make informed decisions about enrollment

## Acceptance Criteria
- [ ] Admin can edit the section heading (up to 50 characters)
- [ ] Admin can edit 4 audience cards, each with:
  - Image (minimum 360×430 pixels)
  - Description (up to 300 characters)
- [ ] Each card has an independent character counter
- [ ] Admin can upload/delete images per card
- [ ] System validates all images and descriptions
- [ ] Changes save only when "Publish" is clicked
- [ ] Published cards appear on public page

## Sprint Demo Scenario
**Demo Flow**:
1. Navigate to "Who the Programs Suit" section
2. Edit heading to "Is Hippotherapy Right for You?"
3. Update Card 1: "Children with developmental delays" + relevant image
4. Update Card 2: "Adults recovering from injury" + image
5. Update Card 3: "Individuals with autism spectrum disorders" + image
6. Update Card 4: "People with mobility challenges" + image
7. Show counters for each card: "98/300", "112/300", etc.
8. Publish changes
9. Public page displays 4 cards helping visitors identify suitability

## Test Scenarios

### Scenario 1: Happy Path - Complete Section Update
**Given** admin is on the Hippotherapy admin page
**When** admin edits heading and all 4 cards with images and descriptions
**And** clicks "Publish"
**Then** changes save successfully
**And** public page shows audience segmentation clearly

### Scenario 2: Validation - Mixed Valid/Invalid Cards
**Given** admin is editing the section
**When** Cards 1-2 are valid but Card 3 description is too short
**Then** Card 3 shows error "Minimum 10 characters"
**And** Publish button is disabled

### Scenario 3: Independent Card Image Management
**Given** admin is updating the section
**When** admin uploads new image for Card 1 only
**Then** only Card 1 image changes
**And** Cards 2-4 images remain unchanged

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h)
- TS18: Who Programs Suit section component (6h)
- TS15: Image upload field component (shared) (0h)
- TS16: Text input field component (shared) (0h)
- TS22: Hippotherapy API service (shared) (0h)
- TS37: Section with cards integration tests (4h)

**Total Effort**: 10 hours

## Sprint Goal
Admin can manage the audience targeting section with 4 cards, helping visitors understand who benefits from hippotherapy programs.

## Dependencies
- BS01 (foundation and shared components)
- BS06 (similar card-based section pattern)
