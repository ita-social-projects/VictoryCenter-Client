# BS01: Title Section Content Management

## User Story
**As a** Victory Center admin
**I want** to manage the hippotherapy page title section (heading, description, and hero image)
**So that** visitors see an engaging introduction to the hippotherapy program

## Business Value
The title section is the first impression visitors get when landing on the hippotherapy page. Admin control over this content allows the center to:
- Update messaging to reflect current programs
- Refresh hero imagery seasonally or for campaigns
- Maintain brand consistency with reviewed, quality content

## Acceptance Criteria
- [ ] Admin can edit the title heading (up to 50 characters)
- [ ] Admin can edit the title description (up to 300 characters)
- [ ] Admin can upload a new hero image (minimum 1440×660 pixels)
- [ ] Admin can delete an uploaded image and revert to the default
- [ ] System validates image file size (max 5 MB) and format (jpeg, jpg, png, webp)
- [ ] System prevents publication if required fields are empty or below minimum length
- [ ] Changes are saved only when admin clicks "Publish"
- [ ] Published changes appear immediately on the public hippotherapy page

## Sprint Demo Scenario
**Setup**: Admin logs into the admin panel and navigates to the Hippotherapy page

**Demo Flow**:
1. Show the existing title section with current content
2. Edit the heading to "Therapeutic Horseback Riding for All Ages"
3. Update the description to explain hippotherapy benefits
4. Upload a new hero image showing therapy in action
5. Preview the character counters showing "45/50" and "178/300"
6. Click "Publish" and confirm changes
7. Navigate to public site and show the updated title section
8. Return to admin panel - "Publish" button is now disabled (no changes)

## Test Scenarios

### Scenario 1: Happy Path - Edit and Publish Title Section
**Given** admin is on the Hippotherapy admin page
**When** admin edits heading, description, and uploads a valid image
**And** admin clicks "Publish" and confirms
**Then** success message appears "Changes published successfully"
**And** Publish button becomes disabled
**And** public site displays the updated content

### Scenario 2: Image Validation - Too Small
**Given** admin is editing the title section
**When** admin uploads an image with dimensions 1000×500
**Then** error message appears "Image must be at least 1440×660 pixels"
**And** the previous image remains
**And** Publish button stays disabled

### Scenario 3: Validation - Heading Too Short
**Given** admin is editing the title heading
**When** admin enters "Therapy" (7 characters) and clicks outside the field
**Then** error message appears "Minimum 5 characters"
**And** character counter shows "7/50"
**And** Publish button stays disabled

### Scenario 4: Delete Uploaded Image
**Given** admin has uploaded a custom hero image
**When** admin hovers over the image and clicks Delete
**And** confirms "Delete photo?" with "Yes"
**Then** the default hero image appears
**And** Publish button becomes enabled (due to content change)

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (4h)
- TS08: Title section component (4h)
- TS15: Image upload field component (6h)
- TS22: Hippotherapy API service (4h)
- TS29: Title section integration tests (3h)

**Total Effort**: 21 hours

## Sprint Goal
Admin can fully manage the hippotherapy page title section including heading, description, and hero image. Changes are validated before publication and appear immediately on the public site.

## Dependencies
- None (foundation story)
