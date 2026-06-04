# refinement-validator

## Purpose

Evaluate whether a mockup, prototype, or design is ready for refinement session or implementation.

## When to Use This Skill

- Before scheduling a refinement session
- After completing a prototype or mockup review
- When validating that design specifications are complete
- To determine if developer or stakeholder input is needed first
- As a final checkpoint before handoff

## Responsibilities

Check for:
- **Missing states**: Loading, error, empty, disabled, success states
- **Hidden dependencies**: External systems, data sources, permissions
- **Incomplete flows**: Entry points, exit points, alternative paths
- **Undocumented assumptions**: Business rules, validation logic, edge case handling
- **Unclear validations**: What rules apply, when they're checked, what messages show
- **Unresolved permissions**: Who can access, edit, or perform actions

## Validation Checklist

### States Coverage
- [ ] Happy path documented
- [ ] Loading/pending states defined
- [ ] Error states and messages specified
- [ ] Empty states (no data) addressed
- [ ] Disabled/unavailable states explained
- [ ] Success confirmation behavior defined

### Flow Completeness
- [ ] Entry points identified (how users reach this flow)
- [ ] Exit points defined (where users go after completion)
- [ ] Alternative paths documented (what if user cancels, backs out, etc.)
- [ ] Navigation between screens specified
- [ ] State transitions explained

### Business Logic Clarity
- [ ] Validation rules explicitly stated
- [ ] Business constraints documented (e.g., "can't cancel shipped orders")
- [ ] Permission requirements specified
- [ ] Data dependencies identified
- [ ] Edge case handling addressed

### Implementation Dependencies
- [ ] Required API endpoints listed or confirmed available
- [ ] Data models defined or referenced
- [ ] External integrations identified
- [ ] Reusable components noted
- [ ] Technical constraints acknowledged

### User Experience
- [ ] Error recovery paths defined
- [ ] Feedback mechanisms specified (toasts, inline messages)
- [ ] Confirmation steps for destructive actions
- [ ] Accessibility considerations noted

## Output Format

Provide a clear assessment with:

### Readiness Status
One of:
- ✅ **Ready for refinement**: All critical elements documented, minor gaps can be resolved in session
- ⚠️ **Needs clarification**: Key questions must be answered before refinement can be productive
- ❌ **Requires developer input**: Technical feasibility or architecture decisions needed first

### Findings
Organized by category:
- **Complete**: What's well-defined and ready
- **Missing**: What's absent and needed
- **Unclear**: What's mentioned but ambiguous
- **Assumptions**: What's implied but not explicit

### Blocker Questions
Critical questions that must be answered before proceeding.

### Nice-to-Have Questions
Questions that could be resolved during refinement or implementation.

## Rules

- ✅ Never assume visual completeness means implementation completeness
- ✅ Be specific about what's missing (not just "needs more detail")
- ✅ Distinguish between blockers and clarifications that can wait
- ✅ Consider both user experience and technical feasibility
- ✅ Frame findings constructively, not as criticism
- ❌ Don't require perfection; some details can emerge during refinement
- ❌ Don't block on minor UI tweaks or styling questions
- ❌ Don't assume developers will "just figure out" business logic

## Example Validation

```markdown
## Refinement Validation: Order Cancellation Feature

### Readiness Status
⚠️ **Needs clarification** — Core flow is documented, but critical business rules and error handling are ambiguous.

### Findings

#### Complete ✅
- Happy path: Manager clicks cancel button, sees confirmation dialog, confirms, order status changes
- UI components: Button placement, dialog design, status badge update
- Entry point: Cancel button appears on order detail page

#### Missing ❌
- What happens if cancellation fails (network error, concurrent update)?
- How does cancellation affect already-shipped orders (block or allow)?
- Should customer be notified (if yes, how/when)?
- Does cancelled order stay visible in list (if yes, filtered how)?

#### Unclear ⚠️
- Mockup shows "Reason for cancellation" field — is this optional or required?
- Permission check: Can all managers cancel, or only order owner?
- Timing: Can orders in "Shipped" status be cancelled?

#### Assumptions (not documented)
- Assumes cancellation is instant (no pending state)
- Assumes inventory is automatically restored (no UI for this)
- Assumes no undo functionality needed

### Blocker Questions
1. **Can orders in "Shipped" or "Delivered" status be cancelled?** This affects both validation logic and UI button visibility.
2. **What error message should display if cancellation fails?** Need specific wording for network errors vs. business rule violations.
3. **Is customer notification in scope for this feature?** Affects implementation complexity and dependencies.

### Nice-to-Have Questions (can be resolved in refinement)
- Should there be an audit log entry for cancellations?
- What happens to applied discounts when order is cancelled?
- Can managers view cancellation reason after the fact?

### Recommendation
Schedule a 15-minute clarification session with Product Owner to resolve blocker questions, then proceed to refinement. Developer input not needed yet.
```

## Integration with Other Skills

- Run **after** **figma-flow-analysis** and **ui-consistency-review**
- Use findings to inform **handoff-pack-writer**
- If validation reveals implementation complexity, consult **design-to-code-scout**
- For accessibility concerns, invoke **accessibility-review**

## Success Criteria

A design is refinement-ready when:
- All critical user paths are documented
- Business rules are explicit, not assumed
- Error and edge cases have defined behaviors
- Dependencies are identified and addressed
- Team can reasonably estimate implementation effort
