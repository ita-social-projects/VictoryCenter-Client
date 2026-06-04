# ui-consistency-review

## Purpose

Compare proposed flows against existing application patterns to ensure consistency in terminology, behavior, and interaction design.

## When to Use This Skill

- Reviewing new UI flows or mockups before implementation
- Validating prototypes against established patterns
- Detecting terminology inconsistencies
- Checking for pattern reuse opportunities
- Ensuring cohesive user experience across features

## Responsibilities

- Detect inconsistencies in terminology, labels, and messaging
- Compare validation behavior across similar forms/flows
- Compare interaction patterns (modals, toasts, navigation)
- Compare component reuse (buttons, inputs, status badges)
- Identify deviations from established conventions
- Assess whether deviations are intentional improvements or accidental drift

## Review Dimensions

### Terminology
- Status labels, action buttons, field names
- Error messages and validation feedback
- Success confirmations and notifications

### Validation Behavior
- When validation occurs (on blur, on submit, real-time)
- How errors are displayed (inline, toast, modal)
- What triggers validation re-checks

### Interaction Patterns
- Navigation flow (how users move between screens)
- Data submission (forms, inline edits, modals)
- Confirmation dialogs (when used, wording, button order)
- Loading indicators (spinners, skeletons, progress bars)

### Component Reuse
- Button variants and hierarchy (primary, secondary, text)
- Input field styling and behavior
- Status indicators (badges, chips, icons)
- Layout patterns (cards, lists, tables)

## Analysis Process

1. **Identify Equivalent Features**: Find existing features similar to the proposed design
2. **Compare Side-by-Side**: Document differences in terminology, behavior, and patterns
3. **Assess Intent**: Determine if differences are intentional improvements or inconsistencies
4. **Evaluate Impact**: Consider user confusion, implementation cost, and maintainability
5. **Recommend Alignment**: Suggest specific changes to improve consistency

## Output Format

Structure findings as:
- **Existing Pattern**: How the app currently handles similar cases
- **Proposed Pattern**: What the new design introduces
- **Inconsistencies Detected**: Specific differences
- **Recommendations**: Suggested alignments or justifications for deviations

## Rules

- ✅ Prefer reuse over reinvention unless there's a clear improvement
- ✅ Explain inconsistencies clearly with specific examples
- ✅ Highlight accessibility concerns (contrast, keyboard nav, screen readers)
- ✅ Consider both user experience and implementation efficiency
- ✅ Distinguish between stylistic preferences and functional inconsistencies
- ❌ Don't flag differences that are contextually appropriate
- ❌ Don't enforce consistency for its own sake if deviation improves UX
- ❌ Don't overwhelm with minor visual differences; focus on behavior

## Example Review Structure

```markdown
## Consistency Review: New Order Cancellation Flow

### Status Terminology
**Existing Pattern**: Status labels use title case ("In Preparation", "Shipped")
**Proposed Pattern**: Mockup uses sentence case ("In preparation", "Shipped")
**Recommendation**: Align to title case for consistency across all status displays.

### Confirmation Dialogs
**Existing Pattern**: No confirmation dialogs used in current app
**Proposed Pattern**: Mockup shows confirmation modal before cancelling order
**Assessment**: This is an intentional improvement for destructive actions.
**Recommendation**: Keep confirmation dialog; consider adding to other destructive actions.

### Error Display
**Existing Pattern**: Validation errors show as red text below form fields
**Proposed Pattern**: Mockup shows error toast notification at top of page
**Inconsistency**: Mixed error display patterns will confuse users
**Recommendation**: Use inline validation for field errors, toast for system errors.

### Button Hierarchy
**Existing Pattern**: Primary actions use blue filled button, secondary use outlined
**Proposed Pattern**: Mockup matches existing pattern
**Assessment**: ✅ Consistent

### Component Reuse
**Opportunity**: Status badge component from order list can be reused in edit form
**Recommendation**: Ensure mockup reflects existing badge styling
```

## Typical Inputs

- Figma mockups or prototype flows
- Generated UI code or component implementations
- Screenshots or descriptions of existing app pages
- Design system documentation (if available)

## Integration with Other Skills

- Run **after** **figma-flow-analysis** to check patterns against existing app
- Use findings in **refinement-validator** to assess implementation readiness
- Feed recommendations into **handoff-pack-writer** for developer guidance
- Inform **component-mapping** about reuse opportunities

## Accessibility Considerations

Flag potential accessibility issues during consistency review:
- Color-only status indicators (missing text/icons)
- Low contrast text or buttons
- Missing keyboard navigation patterns
- Form fields without proper labels
- Interactive elements without clear focus states
