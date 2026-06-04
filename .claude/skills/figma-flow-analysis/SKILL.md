# figma-flow-analysis

## Purpose

Analyze mockups and flows from a Business Analyst perspective.

## When to Use This Skill

- Inspecting Figma mockups or UI flows
- Reviewing design specifications before implementation
- Identifying missing states or edge cases in designs
- Preparing for refinement sessions
- Validating flow completeness

## Responsibilities

- Identify states (loading, error, empty, success)
- Identify variants (user roles, permissions, conditions)
- Detect missing states in flows
- Detect hidden assumptions in designs
- Identify dependencies between screens/components
- Generate clarification questions for stakeholders

## Focus Areas

- **Loading states**: What happens while data is being fetched?
- **Empty states**: What displays when there's no data?
- **Validation**: What rules apply? When are they checked?
- **Permissions**: Who can see/do what?
- **Transitions**: How do users move between states?
- **Edge cases**: What about unusual data, errors, or concurrent actions?

## Analysis Approach

1. **State Inventory**: List all states explicitly shown in the design
2. **Missing State Detection**: Identify states not documented but likely needed
3. **Assumption Surfacing**: Call out behaviors that seem assumed but not specified
4. **Dependency Mapping**: Note what data, permissions, or actions are prerequisites
5. **Question Generation**: Formulate specific clarification questions

## Output Format

Provide findings in sections:
- **Documented States**: What's explicitly shown
- **Missing States**: What's likely needed but not shown
- **Hidden Assumptions**: Behaviors implied but not specified
- **Dependencies**: Prerequisites or related features
- **Clarification Questions**: Specific questions for stakeholders

## Rules

- ✅ Explain findings in business language, not technical jargon
- ✅ Focus on behaviour and logic, not visual styling
- ✅ Explicitly mention undocumented assumptions
- ✅ Phrase questions to be answerable by non-technical stakeholders
- ✅ Consider the full user journey, not just happy paths
- ❌ Don't assume visual completeness means implementation completeness
- ❌ Don't skip edge cases because they "seem obvious"
- ❌ Don't use overly technical terminology when business terms suffice

## Example Analysis Structure

```markdown
## Flow Analysis: Order Status Update

### Documented States
- Order list with status badges
- Edit form with status dropdown
- Success message after save

### Missing States
- Loading indicator while saving
- Error state if save fails (network issue, validation failure)
- Disabled state for status options (e.g., can't cancel shipped orders)
- Confirmation dialog for destructive changes

### Hidden Assumptions
- Assumes manager always has permission to change status
- Assumes stock validation happens server-side (not shown in UI)
- Implies real-time updates but refresh behavior not specified

### Dependencies
- Requires product stock data for confirmation validation
- May need audit log update (timeline feature)
- Affects customer-facing order status display

### Clarification Questions
1. What should happen if a manager tries to confirm an order with out-of-stock items?
2. Should other managers see status updates in real-time, or only after refresh?
3. Is there a confirmation step before cancelling an order?
4. What error messages should display if the save fails?
```

## Integration with Other Skills

- Use **refinement-validator** after analysis to check if flow is ready for refinement
- Use **ui-consistency-review** to compare flows against existing app patterns
- Use **design-to-code-scout** to map design elements to implementation
- Feed findings into **handoff-pack-writer** for documentation generation
