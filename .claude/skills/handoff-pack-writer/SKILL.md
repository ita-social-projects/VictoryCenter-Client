# handoff-pack-writer

## Purpose

Generate refinement-ready handoff documentation that bridges design, development, and quality assurance by providing a comprehensive feature specification.

## When to Use This Skill

- After design review and validation are complete
- Before refinement session to provide context
- When handing off a feature from BA to development team
- To document approved design changes
- As a basis for QA test planning

## Target Audience

The handoff pack should be useful to:
- **Developers**: Clear implementation guidance
- **QA**: Basis for test cases and acceptance criteria
- **Product Owners**: Feature scope and business rules
- **Stakeholders**: High-level summary and impact

## Required Sections

### 1. Feature Summary
- **What**: One-paragraph description of the feature
- **Why**: Business goal or user problem being solved
- **Scope**: What's included and what's explicitly out of scope

### 2. Affected Areas
- **UI Changes**: Screens, components, navigation paths
- **Business Logic**: Rules, validations, calculations
- **Data Changes**: New fields, schema modifications, migrations needed
- **Integration Points**: APIs, external systems, dependencies

### 3. Dependencies
- **Data Dependencies**: Required data, sources, timing
- **System Dependencies**: External services, APIs
- **Feature Dependencies**: Other features this relies on or affects
- **Technical Prerequisites**: Infrastructure, tooling, environment needs

### 4. User Flows
- **Happy Path**: Step-by-step primary flow
- **Alternative Paths**: Different routes to same outcome
- **Error Paths**: What happens when things go wrong
- **Edge Cases**: Unusual scenarios and their handling

### 5. Business Rules & Validation
- **Explicit Rules**: Documented constraints and logic
- **Validation Requirements**: What to check, when, and what messages to show
- **Permission Rules**: Who can do what
- **State Transitions**: Valid state changes and conditions

### 6. Clarification Questions
- **Resolved**: Questions answered during design review
- **Outstanding**: Questions still needing answers
- **Assumptions**: Decisions made in absence of clear guidance

### 7. Risks & Considerations
- **Technical Risks**: Potential implementation challenges
- **UX Risks**: Usability or accessibility concerns
- **Business Risks**: Impact on users or operations
- **Mitigation Strategies**: How to address identified risks

### 8. Demo Evidence
- **Mockups**: Links to Figma or screenshots
- **Prototypes**: Interactive demos if available
- **Reference Examples**: Similar features in other apps or this app

### 9. Suggested Acceptance Criteria
- **Functional**: Feature works as specified
- **Non-Functional**: Performance, accessibility, security
- **Business**: Achieves intended business outcome
- **Testing**: Specific scenarios to validate

## Document Structure

Use clear hierarchy:
```markdown
# [Feature Name] - Handoff Pack

## 1. Feature Summary
[content]

## 2. Affected Areas
[content]

## 3. Dependencies
[content]

... etc.
```

## Writing Guidelines

### Clarity
- Use clear, unambiguous language
- Define acronyms on first use
- Prefer specific examples over abstract descriptions
- Use bullet points and lists for scannability

### Completeness
- Cover all states (loading, error, empty, success)
- Document both happy path and alternatives
- Include specific examples for validation rules
- Reference related features or documentation

### Actionability
- Frame acceptance criteria as testable statements
- Be specific about error messages, button labels, field names
- Include mockup references with specific frame/screen names
- Provide context for technical decisions

### Balance
- Technical enough for developers to implement
- Business-focused enough for stakeholders to validate
- Detailed enough to avoid ambiguity
- Concise enough to be actually read

## Rules

- ✅ Write for mixed audience (developers, QA, stakeholders)
- ✅ Avoid unnecessary technical depth that obscures meaning
- ✅ Keep assumptions explicit and call them out clearly
- ✅ Link to related documentation, mockups, and code references
- ✅ Use consistent terminology with existing app and team vocabulary
- ✅ Structure for easy navigation (clear headings, logical flow)
- ❌ Don't assume reader has full context — provide it
- ❌ Don't leave critical decisions as "TBD" without timeline
- ❌ Don't write implementation code — focus on "what" not "how"
- ❌ Don't duplicate information that lives authoritatively elsewhere — link to it

## Example Handoff Pack Section

```markdown
# Order Cancellation Feature - Handoff Pack

## 1. Feature Summary

**What**: Managers can cancel orders directly from the order detail page.

**Why**: Currently, managers must contact admin to cancel orders, causing delays. This feature enables managers to handle cancellations independently, improving response time.

**Scope**:
- ✅ Cancel button on order detail page
- ✅ Confirmation dialog before cancellation
- ✅ Status validation (prevent cancelling shipped orders)
- ✅ Audit trail entry for cancellation
- ❌ Customer notification (future enhancement)
- ❌ Inventory restoration (handled by existing warehouse sync)

## 2. Affected Areas

**UI Changes**:
- Order detail page: Add "Cancel Order" button
- Order list: Cancelled orders appear with distinct badge
- Order edit: Disable status changes for cancelled orders

**Business Logic**:
- Validate order status before allowing cancellation
- Record cancellation timestamp and manager ID
- Update order total if cancellation affects discount

**Data Changes**:
- Order schema: Add `cancelledAt` (timestamp) and `cancelledBy` (manager ID) fields
- No database migration needed (fields can be null for existing orders)

**Integration Points**:
- Order service: Add `cancelOrder()` method
- Order API: Add PATCH endpoint for cancellation

## 5. Business Rules & Validation

**Cancellation Rules**:
1. Only orders with status "New", "Confirmed", or "In Preparation" can be cancelled
2. Shipped or Delivered orders cannot be cancelled (block with error message)
3. Already-cancelled orders cannot be cancelled again (hide button)
4. All managers have permission to cancel orders (no role check needed for v1)

**Validation Messages**:
- Cannot cancel shipped: "This order has already been shipped and cannot be cancelled."
- Cannot cancel delivered: "This order has been delivered and cannot be cancelled."
- Cancellation failed: "Unable to cancel order. Please try again or contact support."

**State Transitions**:
- From: New, Confirmed, In Preparation
- To: Cancelled
- Irreversible: Once cancelled, status cannot be changed

## 9. Suggested Acceptance Criteria

**Functional**:
- [ ] Cancel button appears on order detail page for eligible orders
- [ ] Cancel button does NOT appear for shipped, delivered, or already-cancelled orders
- [ ] Confirmation dialog shows before cancellation with "Cancel Order" and "Go Back" options
- [ ] Clicking "Cancel Order" in dialog changes status to "Cancelled"
- [ ] Cancelled orders show "Cancelled" badge in order list
- [ ] Order edit page blocks status changes for cancelled orders
- [ ] Cancellation records timestamp and manager ID in database

**Error Handling**:
- [ ] Attempting to cancel shipped order shows validation error
- [ ] Network error during cancellation shows error message
- [ ] User can retry cancellation after error

**Non-Functional**:
- [ ] Cancellation completes within 2 seconds under normal conditions
- [ ] Cancel button is keyboard accessible (tab + enter)
- [ ] Confirmation dialog can be dismissed with Escape key
- [ ] Screen reader announces status change after cancellation

**Business**:
- [ ] Manager can cancel order without admin intervention
- [ ] Cancelled orders remain visible in order history
- [ ] Cancellation is auditable (who cancelled and when)
```

## Integration with Other Skills

- Compile findings from **figma-flow-analysis**, **ui-consistency-review**, and **refinement-validator**
- Use **design-to-code-scout** mapping for "Affected Areas" section
- Apply **prototype-humanizer** to improve readability
- Reference **accessibility-review** findings in risks and acceptance criteria
- Use **component-mapping** insights for implementation guidance

## Success Criteria

A complete handoff pack enables:
- Development team to implement without constant clarification
- QA team to write test cases directly from acceptance criteria
- Product owner to validate scope and business rules
- Stakeholders to understand feature impact and timeline
- Future team members to understand design decisions
