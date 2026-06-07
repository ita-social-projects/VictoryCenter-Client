# BS07: What the Approach Shows Section Management

## User Story
**As a** Victory Center admin
**I want** to manage the "What the Approach Shows" section content
**So that** visitors understand the proven outcomes of the therapeutic approach

## Business Value
This section provides evidence of effectiveness, building credibility. Admin control enables:
- Highlighting recent success metrics
- Updating content with latest outcome data
- Positioning the center as results-driven
- Supporting families in making informed decisions

## Acceptance Criteria
- [ ] Admin can edit the section heading (up to 50 characters)
- [ ] Admin can edit the description with rich text (up to 1000 characters)
- [ ] Rich text editor supports bold, italic, and link insertion
- [ ] Character counter displays in real-time
- [ ] System validates minimum length requirements
- [ ] Changes save only when "Publish" is clicked
- [ ] Published content displays on public page

## Sprint Demo Scenario
**Demo Flow**:
1. Navigate to "What the Approach Shows" section
2. Edit heading to "Proven Results"
3. Update description with outcome statistics, bold key numbers
4. Add link to research supporting claims
5. Counter shows "523/1000"
6. Publish changes
7. Public page displays results-focused content with formatted statistics

## Test Scenarios

### Scenario 1: Happy Path - Edit Outcomes Section
**Given** admin is on the Hippotherapy admin page
**When** admin updates heading and description with statistics
**And** clicks "Publish"
**Then** changes save successfully
**And** public page shows evidence-based content

### Scenario 2: Rich Text - Multiple Formatting
**Given** admin is editing the description
**When** admin applies bold to statistics, italic to quotes, and adds links
**Then** all formatting appears correctly in editor
**And** public page renders all formatting properly

## Technical Implementation
This business story is implemented by:
- TS01: Foundation types and constants (shared) (0h)
- TS14: What the Approach Shows section component (4h)
- TS16: Text input field with rich text (shared) (0h)
- TS22: Hippotherapy API service (shared) (0h)
- TS35: Section integration tests (2h)

**Total Effort**: 6 hours

## Sprint Goal
Admin can manage the outcomes section to showcase proven results and build visitor confidence in the therapeutic approach.

## Dependencies
- BS01 (foundation and shared components)
- BS02 (similar section pattern)
