# BS04: What Is Ipoventia Section Management

## User Story
**As a** Victory Center admin
**I want** to manage the "What is Ipoventia" section content
**So that** visitors understand this specific therapeutic approach used at the center

## Business Value
Ipoventia is a specialized approach that differentiates Victory Center. Admin control enables:
- Clearly explaining the methodology to potential clients
- Updating content as the approach evolves
- Positioning the center as a leader in this therapeutic field
- Educating families about treatment options

## Acceptance Criteria
- [ ] Admin can edit the section heading (up to 50 characters)
- [ ] Admin can edit the description with rich text formatting (up to 1000 characters)
- [ ] Rich text editor supports bold, italic, and link insertion
- [ ] Character counter shows remaining space in real-time
- [ ] System validates minimum length requirements
- [ ] Changes are saved only when "Publish" is clicked
- [ ] Published content displays on the public hippotherapy page

## Sprint Demo Scenario
**Setup**: Admin is logged in to the Hippotherapy admin page

**Demo Flow**:
1. Scroll to "What is Ipoventia" section
2. Update heading to "The Ipoventia Method"
3. Edit description explaining the approach, bolding key terms
4. Add a link to supporting research
5. Character counter shows "687/1000"
6. Click "Publish" and confirm
7. View public page - formatted content displays correctly
8. Visitors can click the research link to learn more

## Test Scenarios

### Scenario 1: Happy Path - Edit Ipoventia Section
**Given** admin is on the Hippotherapy admin page
**When** admin updates heading and description with rich text formatting
**And** admin clicks "Publish"
**Then** changes save successfully
**And** public page displays formatted content

### Scenario 2: Validation - Heading Empty
**Given** admin is editing the heading
**When** admin deletes all text and clicks outside the field
**Then** error message appears "Field is required"
**And** Publish button is disabled

### Scenario 3: Rich Text - Bold and Link Combined
**Given** admin is editing the description
**When** admin bolds text and then adds a link to the bolded text
**Then** text appears bold and underlined in editor
**And** public page shows bold, clickable link

### Scenario 4: Character Limit Enforcement
**Given** admin is editing the description
**When** admin types until reaching 1000 characters
**Then** counter shows "1000/1000"
**And** further input is blocked
**And** admin receives visual feedback (e.g., counter turns red)

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h)
- TS11: What Is Ipoventia section component (4h)
- TS16: Text input field with rich text (shared) (0h)
- TS22: Hippotherapy API service (shared) (0h)
- TS32: Section integration tests (2h)

**Total Effort**: 6 hours

## Sprint Goal
Admin can manage the "What is Ipoventia" educational section with full rich text editing. Content is validated and published to help visitors understand this specialized therapeutic approach.

## Dependencies
- BS01 (foundation and shared components)
- BS02 (similar section pattern established)
