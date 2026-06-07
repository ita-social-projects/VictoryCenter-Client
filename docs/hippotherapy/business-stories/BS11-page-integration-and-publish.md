# BS11: Page Integration and Publish Workflow

## User Story
**As a** Victory Center admin
**I want** all 11 sections integrated on one admin page with a unified publish workflow
**So that** I can efficiently manage the entire hippotherapy page and see changes reflected immediately on the public site

## Business Value
A unified admin page provides:
- Single-page workflow for content management (no navigation between sections)
- Clear visibility of all page content at once
- Unified publish action ensuring consistency
- Reduced errors from partial updates
- Efficient content review before publication

## Acceptance Criteria
- [ ] All 11 sections appear on one scrollable admin page in correct order
- [ ] Admin can edit any section without losing changes in other sections
- [ ] Publish button is disabled on page load (even if content exists)
- [ ] Publish button enables only when:
  - At least one section has changes (dirty state)
  - All changed sections pass validation
- [ ] Clicking "Publish" shows confirmation modal "Publish changes?"
- [ ] Confirming publication:
  - Saves all changes via API
  - Shows success toast "Changes published successfully"
  - Disables Publish button (no pending changes)
  - Updates public hippotherapy page immediately
- [ ] Page loads existing content from API on mount
- [ ] Loading spinner displays during initial data fetch
- [ ] Error messages display if API calls fail

## Sprint Demo Scenario
**Demo Flow**:
1. Admin logs in and navigates to `/admin-panel/hippotherapy`
2. Page loads with loading spinner, then displays all 11 sections
3. Publish button is disabled (no changes yet)
4. Scroll through page showing all sections: Title, What Is Hippotherapy, Testimonials, What Is Ipoventia, Center of Ipoventia, Why This Approach, What the Approach Shows, Scientific Research, second Testimonials, Who Programs Suit, Principles
5. Edit Title section heading - Publish button remains disabled (validation pending)
6. Complete edit and blur - Publish button enables (dirty + valid)
7. Edit Scientific Research section, add a new reference
8. Edit Principles section, update description 3
9. Publish button still enabled (multiple sections dirty)
10. Click "Publish" - confirmation modal appears
11. Confirm - loading state appears on button
12. Success toast appears "Changes published successfully"
13. Publish button becomes disabled
14. Navigate to public hippotherapy page - all changes are visible
15. Return to admin page - Publish button still disabled (no new changes)

## Test Scenarios

### Scenario 1: Happy Path - Multi-Section Update
**Given** admin is on the Hippotherapy admin page
**When** admin edits Title, Testimonials, and Principles sections
**And** all changes are valid
**And** clicks "Publish" and confirms
**Then** API saves all 3 sections
**And** success toast appears
**And** Publish button becomes disabled
**And** public page shows all updates

### Scenario 2: Validation - Mixed Valid/Invalid Sections
**Given** admin is editing multiple sections
**When** Title section is valid but Scientific Research has an invalid URL
**Then** Publish button is disabled
**And** Scientific Research shows validation error
**And** fixing the error enables Publish button

### Scenario 3: Cancel Publication
**Given** admin has made changes to multiple sections
**When** admin clicks "Publish"
**And** confirmation modal appears
**And** admin clicks "No" or "Cancel"
**Then** modal closes
**And** no API calls are made
**And** changes remain unsaved (dirty state)
**And** Publish button remains enabled

### Scenario 4: API Error Handling
**Given** admin has made valid changes
**When** admin clicks "Publish" and confirms
**And** API returns an error (network failure, server error)
**Then** error toast appears "Failed to save changes. Please try again."
**And** changes remain unsaved
**And** Publish button remains enabled (can retry)

### Scenario 5: Page Load with Existing Content
**Given** hippotherapy page content exists in database
**When** admin navigates to the page
**Then** loading spinner displays briefly
**And** all 11 sections load with existing content
**And** Publish button is disabled (no changes yet)

### Scenario 6: Dirty State Tracking
**Given** admin is on the hippotherapy page
**When** admin edits Title section heading
**And** clicks outside the field (blur)
**Then** page state marks Title section as dirty
**And** Publish button enables (if valid)
**When** admin reverts heading to original value
**Then** page state marks Title section as clean
**And** Publish button disables (no dirty sections)

## Technical Implementation
This business story is implemented by:
- TS20: Main hippotherapy admin page component (8h)
- TS21: useHippotherapyAdmin custom hook (6h)
- TS22: Hippotherapy API service (shared) (0h)
- TS23: Publish button component (4h)
- TS24: Page routing and navigation (2h)
- TS39: End-to-end integration tests (6h)

**Total Effort**: 26 hours

## Sprint Goal
All 11 hippotherapy sections are integrated into a single, efficient admin page with unified publish workflow, dirty state tracking, and comprehensive validation.

## Dependencies
- BS01-BS10 (all individual sections must be built)
