# BS05: Center of Ipoventia Section Management

## User Story
**As a** Victory Center admin
**I want** to manage the "Center of Ipoventia" section (heading, descriptions, and image)
**So that** visitors understand what the center focuses on in this therapeutic approach

## Business Value
This section highlights the center's core philosophy and approach. Admin control allows:
- Emphasizing the patient-centered methodology
- Updating images to reflect current programs
- Refining messaging based on visitor feedback
- Maintaining professional, accurate content

## Acceptance Criteria
- [ ] Admin can edit the section heading (up to 50 characters)
- [ ] Admin can edit the main description (up to 300 characters)
- [ ] Admin can edit the additional description (up to 50 characters)
- [ ] Admin can upload a section image (minimum 1440×420 pixels)
- [ ] Admin can delete uploaded image and revert to default
- [ ] All fields show character counters
- [ ] Validation prevents publication of invalid content
- [ ] Published changes appear on public hippotherapy page

## Sprint Demo Scenario
**Demo Flow**:
1. Navigate to "Center of Ipoventia" section
2. Edit heading, main description, and additional description
3. Upload a new image showing the patient-centered approach
4. Show all three character counters updating: "42/50", "215/300", "38/50"
5. Publish changes
6. View public page - complete section with image and text displays correctly

## Test Scenarios

### Scenario 1: Happy Path - Complete Section Edit
**Given** admin is on the Hippotherapy admin page
**When** admin edits heading, both descriptions, and uploads valid image
**And** clicks "Publish"
**Then** all changes save successfully
**And** public page displays the complete updated section

### Scenario 2: Image Validation - File Too Large
**Given** admin is uploading a section image
**When** admin selects a 7 MB image file
**Then** error appears "Image must be under 5 MB"
**And** previous image remains

### Scenario 3: Optional Field - Additional Description
**Given** admin is editing the section
**When** admin leaves additional description empty
**Then** no validation error appears (field is optional)
**And** Publish button can be enabled if other fields are valid

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h)
- TS12: Center of Ipoventia section component (5h)
- TS15: Image upload field component (shared) (0h)
- TS16: Text input field component (shared) (0h)
- TS22: Hippotherapy API service (shared) (0h)
- TS33: Section integration tests (3h)

**Total Effort**: 8 hours

## Sprint Goal
Admin can manage the "Center of Ipoventia" section with heading, two description fields, and an image, providing visitors with a complete understanding of the center's approach.

## Dependencies
- BS01 (foundation and shared components)
