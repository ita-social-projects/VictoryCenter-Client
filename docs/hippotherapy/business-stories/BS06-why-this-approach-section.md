# BS06: Why This Approach Section Management

## User Story
**As a** Victory Center admin
**I want** to manage the "Why This Approach" section with heading and 4 benefit cards
**So that** visitors understand the key advantages of the hippotherapy approach

## Business Value
This section persuades visitors by highlighting benefits. Admin control enables:
- Emphasizing the most compelling benefits
- Updating card content based on client feedback
- Refreshing images to show diverse applications
- Maintaining relevant, persuasive messaging

## Acceptance Criteria
- [ ] Admin can edit the section heading (up to 50 characters)
- [ ] Admin can edit 4 benefit cards, each with:
  - Image (minimum 360×430 pixels)
  - Description (up to 300 characters)
- [ ] Each card shows a character counter for its description
- [ ] Admin can upload/delete images for each card independently
- [ ] System validates all images and descriptions
- [ ] Changes require publication via "Publish" button
- [ ] Published cards appear on public hippotherapy page in order

## Sprint Demo Scenario
**Demo Flow**:
1. Navigate to "Why This Approach" section
2. Edit section heading to "Four Key Benefits"
3. Update Card 1: upload image, edit description "Improves motor skills through natural movement"
4. Update Card 2: edit description, show counter "142/300"
5. Update Cards 3 and 4 similarly
6. Publish changes
7. View public page - 4 cards display with images and descriptions in a grid layout

## Test Scenarios

### Scenario 1: Happy Path - Edit All Cards
**Given** admin is on the Hippotherapy admin page
**When** admin edits heading and all 4 card descriptions and images
**And** clicks "Publish"
**Then** all changes save successfully
**And** public page shows 4 cards with updated content

### Scenario 2: Validation - One Card Invalid
**Given** admin is editing the section
**When** admin fills Cards 1-3 correctly but leaves Card 4 description empty
**Then** Card 4 shows validation error "Field is required"
**And** Publish button is disabled

### Scenario 3: Independent Card Management
**Given** admin is editing Card 2
**When** admin uploads a new image for Card 2 only
**Then** Card 2 image updates
**And** Cards 1, 3, 4 images remain unchanged
**And** Publish button enables (content changed)

### Scenario 4: Character Counter Per Card
**Given** admin is editing Card 3 description
**When** admin types text
**Then** only Card 3's counter updates: "87/300"
**And** other card counters remain unchanged

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h)
- TS13: Why This Approach section component (6h)
- TS15: Image upload field component (shared) (0h)
- TS16: Text input field component (shared) (0h)
- TS22: Hippotherapy API service (shared) (0h)
- TS34: Section with cards integration tests (4h)

**Total Effort**: 10 hours

## Sprint Goal
Admin can manage the "Why This Approach" section with a heading and 4 benefit cards, each with image and description, providing visitors with clear, visual reasons to choose hippotherapy.

## Dependencies
- BS01 (foundation and shared components)
