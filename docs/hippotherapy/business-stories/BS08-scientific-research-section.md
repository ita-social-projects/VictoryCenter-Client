# BS08: Scientific Research Section Management

## User Story
**As a** Victory Center admin
**I want** to manage the scientific research section with heading, description, and reference list
**So that** visitors can access supporting research and verify the approach's scientific basis

## Business Value
Citing scientific research builds credibility and trust with families and medical professionals. Admin control enables:
- Maintaining an up-to-date bibliography
- Adding new research as it becomes available
- Providing clickable links to authoritative sources
- Demonstrating evidence-based practice

## Acceptance Criteria
- [ ] Admin can edit section heading (up to 50 characters)
- [ ] Admin can edit section description (up to 300 characters)
- [ ] Admin can add new research references dynamically
- [ ] Each reference has:
  - Name field (up to 150 characters)
  - Link field (up to 1000 characters, URL format)
- [ ] Admin can expand/collapse individual references
- [ ] Admin can delete references (with confirmation)
- [ ] System prevents deleting the last reference (minimum 1 required)
- [ ] "Add +" button is disabled until all existing references are valid
- [ ] Changes require publication via "Publish" button
- [ ] Published references appear on public page as clickable links

## Sprint Demo Scenario
**Demo Flow**:
1. Navigate to "Scientific Research" section
2. Edit section heading and description
3. Show existing references in collapsed state
4. Expand Reference 1, edit name and link
5. Click "Add +" to create a new reference entry
6. Fill in new reference: "Smith et al. (2025) - Hippotherapy Outcomes Study"
7. Add URL to the research paper
8. Try to add another reference - "Add +" is disabled (current entry not validated yet)
9. Complete validation, "Add +" becomes enabled
10. Delete a reference - confirmation appears, confirm deletion
11. Publish changes
12. Public page shows research list with clickable links to papers

## Test Scenarios

### Scenario 1: Happy Path - Add New Reference
**Given** admin is on the Hippotherapy admin page
**When** admin clicks "Add +" button
**And** fills in reference name and valid URL
**And** clicks outside the fields (validation passes)
**Then** "Add +" button becomes enabled again
**And** new reference can be published

### Scenario 2: Validation - Invalid URL Format
**Given** admin is adding a new reference
**When** admin enters "not-a-url" in the link field
**And** clicks outside the field
**Then** error appears "Invalid URL format"
**And** "Add +" button stays disabled

### Scenario 3: Delete Reference - Last Entry Protection
**Given** admin has exactly 1 reference in the list
**When** admin views the reference entry
**Then** delete icon is hidden (cannot delete last entry)

### Scenario 4: Delete Reference - Multiple Entries
**Given** admin has 3 references in the list
**When** admin clicks delete on Reference 2
**Then** confirmation modal appears "Delete scientific research?"
**When** admin clicks "Yes"
**Then** Reference 2 is removed
**And** remaining references are References 1 and 3

### Scenario 5: Expand/Collapse Behavior
**Given** admin has multiple references
**When** admin clicks expand on Reference 1
**Then** Reference 1 shows name and link fields
**And** other references remain collapsed
**When** admin clicks collapse on Reference 1
**Then** Reference 1 returns to collapsed state showing only the title

### Scenario 6: Add Button Disabled State
**Given** admin has clicked "Add +" and a new empty entry exists
**When** admin leaves fields empty
**Then** "Add +" button is disabled
**And** cannot create another new entry until current one is completed

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h)
- TS05: Scientific references CRUD component (8h)
- TS16: Text input field component (shared) (0h)
- TS17: Confirmation modal component (3h)
- TS22: Hippotherapy API service (shared) (0h)
- TS36: Scientific research integration tests (4h)

**Total Effort**: 15 hours

## Sprint Goal
Admin can manage a dynamic list of scientific research references with validation, providing visitors with authoritative sources that support the hippotherapy approach.

## Dependencies
- BS01 (foundation and shared components)
