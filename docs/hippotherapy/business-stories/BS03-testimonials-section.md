# BS03: Testimonials Section Management

## User Story
**As a** Victory Center admin
**I want** to manage testimonial content (quote, author, and photo)
**So that** visitors can see authentic stories from program participants

## Business Value
Testimonials build trust and credibility with prospective clients and donors. Admin control allows:
- Featuring current success stories
- Rotating testimonials seasonally
- Showcasing diverse participant experiences
- Updating photos to reflect active programs

## Acceptance Criteria
- [ ] Admin can edit the testimonial quote (up to 100 characters)
- [ ] Admin can edit the author attribution (up to 50 characters)
- [ ] Admin can upload a testimonial photo (minimum 1400×800 pixels)
- [ ] Admin can delete the photo and revert to default
- [ ] System validates image file format and dimensions
- [ ] Character counters display for both text fields
- [ ] Changes require publication via "Publish" button
- [ ] Published testimonials appear on the public hippotherapy page

## Sprint Demo Scenario
**Setup**: Admin is logged in and viewing the Hippotherapy admin page

**Demo Flow**:
1. Scroll to first Testimonials section
2. Edit the quote: "Hippotherapy changed our child's life. We've seen remarkable progress."
3. Edit the author: "Maria P., Parent"
4. Upload a photo of a testimonial provider (anonymized or stock image)
5. Show validation: quote counter shows "72/100", author shows "18/50"
6. Click "Publish" and confirm
7. Navigate to public page - testimonial displays with photo and attribution
8. Return to admin - Publish button is disabled (no pending changes)

## Test Scenarios

### Scenario 1: Happy Path - Add New Testimonial
**Given** admin is on the Hippotherapy admin page
**When** admin fills in quote, author, and uploads a valid photo
**And** admin clicks "Publish"
**Then** success message appears
**And** public page displays the complete testimonial with image

### Scenario 2: Validation - Quote Too Short
**Given** admin is editing the testimonial quote
**When** admin enters "Great!" (6 characters) and clicks outside field
**Then** error message appears "Minimum 10 characters"
**And** Publish button stays disabled

### Scenario 3: Image Validation - Invalid Format
**Given** admin is uploading a testimonial photo
**When** admin selects a .bmp file
**Then** error message appears "Invalid format, allowed: jpeg, jpg, png, webp"
**And** previous image remains
**And** Publish button stays disabled

### Scenario 4: Delete and Revert to Default
**Given** admin has uploaded a custom testimonial photo
**When** admin hovers over the photo and clicks Delete
**And** confirms deletion
**Then** default testimonial image appears
**And** Publish button becomes enabled (content changed)

### Scenario 5: Character Counter at Maximum
**Given** admin is editing the quote field
**When** admin types until reaching 100 characters
**Then** counter shows "100/100"
**And** further input is blocked
**And** admin can still edit/delete existing characters

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h)
- TS10: Testimonials section component (4h)
- TS15: Image upload field component (shared) (0h)
- TS16: Text input field component (shared) (0h)
- TS22: Hippotherapy API service (shared) (0h)
- TS31: Testimonials integration tests (3h)

**Total Effort**: 7 hours

## Sprint Goal
Admin can manage testimonial content including quotes, author attribution, and photos. Testimonials are validated and published to build trust with site visitors.

## Dependencies
- BS01 (foundation and shared components must exist)
