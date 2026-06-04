# accessibility-review

## Purpose

Detect UX and accessibility risks early in the design process by reviewing mockups, prototypes, and implementations for common accessibility issues.

## When to Use This Skill

- Reviewing Figma mockups before implementation
- Validating prototypes before handoff
- Auditing existing features for accessibility issues
- Responding to accessibility-related questions
- Before refinement session to flag potential issues
- During QA planning to ensure accessibility test coverage

## Responsibilities

Review for:
- **Button hierarchy**: Clear visual distinction between primary, secondary, and tertiary actions
- **Contrast assumptions**: Text and interactive elements meet WCAG contrast requirements
- **Keyboard accessibility**: All interactive elements reachable and operable via keyboard
- **Form clarity**: Labels, error messages, and instructions are clear and associated correctly
- **Disabled states**: Disabled elements are perceivable but clearly distinguished from enabled ones
- **Validation visibility**: Error states are announced and visible to all users
- **Focus management**: Logical focus order and visible focus indicators
- **Screen reader support**: Content is perceivable and navigable with assistive technology

## Review Dimensions

### Visual Accessibility

**Color Contrast**:
- Text on background: minimum 4.5:1 for normal text, 3:1 for large text
- Interactive elements: minimum 3:1 against adjacent colors
- Focus indicators: minimum 3:1 against background

**Visual Hierarchy**:
- Primary vs. secondary actions clearly distinguished
- Status indicators don't rely solely on color (use icons or text too)
- Disabled states visually distinct but still perceivable

**Text Readability**:
- Font size at least 16px for body text
- Line height adequate for readability (typically 1.5)
- Sufficient spacing between interactive elements

### Keyboard Accessibility

**Navigation**:
- All interactive elements reachable via Tab key
- Logical tab order follows visual layout
- Modal dialogs trap focus appropriately
- Skip links for long navigation menus (if applicable)

**Operation**:
- All actions performable without mouse
- Enter/Space activate buttons and links
- Escape closes dialogs and dropdowns
- Arrow keys navigate within menus/lists

**Focus Indicators**:
- Visible focus outline on all interactive elements
- Focus outline sufficient contrast (3:1 minimum)
- Focus outline not removed by custom styles

### Screen Reader Accessibility

**Semantic HTML**:
- Headings used for structure (h1, h2, etc.)
- Lists used for grouped items (ul, ol)
- Buttons vs. links used appropriately
- Form fields have associated labels

**ARIA Attributes** (when needed):
- aria-label or aria-labelledby for unlabeled elements
- aria-describedby for additional context
- aria-live for dynamic content updates
- role attributes for custom widgets

**Content Structure**:
- Alternative text for informative images
- Empty or decorative images hidden from screen readers
- Icon-only buttons have accessible labels
- Loading states announced

### Form Accessibility

**Labels**:
- Every input has a visible, associated label
- Labels are descriptive and clear
- Required fields indicated both visually and programmatically

**Validation**:
- Error messages clearly associated with fields
- Errors announced to screen readers (aria-live or focus management)
- Error messages provide actionable guidance
- Inline validation doesn't interrupt typing

**Disabled States**:
- Disabled fields perceivable but not operable
- Reason for disabled state explained if not obvious
- Avoid disabling submit button if inline validation provides feedback

## Risk Categories

### High Priority (Block Implementation)
- Color-only status indicators without text/icon alternative
- Interactive elements not keyboard accessible
- Form fields without labels
- Contrast below 3:1 for interactive elements
- Critical content hidden from screen readers

### Medium Priority (Fix Soon)
- Contrast between 3:1 and 4.5:1 (meets AA for large text only)
- Missing focus indicators on some elements
- Non-semantic HTML structure
- Icon-only buttons without accessible labels
- Inconsistent button hierarchy

### Low Priority (Improve When Possible)
- Sub-optimal tab order but still functional
- Verbose or redundant screen reader text
- Missing skip links (on pages without long navigation)
- Line height or spacing could be improved

## Output Format

Structure findings as:

### Summary
- Overall accessibility posture (Good / Needs Improvement / Critical Issues)
- High-priority issues count

### Findings by Category
For each issue:
- **Issue**: Description of the problem
- **Impact**: Who is affected and how (e.g., "Screen reader users cannot...", "Keyboard users must...")
- **Location**: Where in the mockup/code this occurs
- **Recommendation**: Specific fix or improvement
- **Priority**: High / Medium / Low

### Quick Wins
Issues that are easy to fix and have significant impact

### Testing Recommendations
Specific accessibility tests to include in QA plan

## Rules

- ✅ Focus on business impact ("Users with low vision can't read error messages")
- ✅ Explain accessibility as usability risk, not just compliance
- ✅ Keep recommendations practical and actionable
- ✅ Distinguish between must-fix and nice-to-have issues
- ✅ Consider full range of disabilities (vision, motor, cognitive, auditory)
- ✅ Reference WCAG standards when helpful, but don't require expertise
- ❌ Don't require perfection — prioritize by user impact
- ❌ Don't assume all accessibility issues can be detected from mockups alone
- ❌ Don't overwhelm with theoretical issues — focus on real risks
- ❌ Don't use inaccessible jargon when explaining accessibility

## Example Review

```markdown
## Accessibility Review: Order Edit Form

### Summary
**Posture**: Needs Improvement  
**Critical Issues**: 2 high-priority issues must be addressed before implementation

### Findings

#### High Priority

**Issue**: Status dropdown has no visible label
**Impact**: Screen reader users won't know what the dropdown is for. Keyboard users navigating the form won't have clear context.
**Location**: Edit form mockup, status selection field
**Recommendation**: Add visible label "Order Status" above dropdown. If design constraints prevent visible label, use aria-label, but visible is strongly preferred.
**Priority**: High

**Issue**: Error messages rely on red color only
**Impact**: Users with color blindness cannot distinguish error state. 8% of men have some form of color vision deficiency.
**Location**: Discount field validation error
**Recommendation**: Add error icon (⚠️ or similar) before error message text. Ensure error text is also programmatically associated with field via aria-describedby.
**Priority**: High

#### Medium Priority

**Issue**: Cancel button has insufficient contrast
**Impact**: Users with low vision may have difficulty perceiving the cancel button
**Location**: Bottom of edit form
**Recommendation**: Increase button border contrast to at least 3:1 against white background. Current gray appears close to 2:1.
**Priority**: Medium

**Issue**: Save button disabled until form is valid, with no explanation
**Impact**: Users may not understand why button is disabled or what they need to fix
**Location**: Submit button
**Recommendation**: Consider keeping button enabled and showing validation errors on submit, OR add helper text explaining "Complete required fields to enable save"
**Priority**: Medium

#### Low Priority

**Issue**: Form fields could have more vertical spacing
**Impact**: Users with motor impairments may have difficulty clicking correct field
**Location**: Overall form layout
**Recommendation**: Increase spacing between fields to at least 16px vertical gap
**Priority**: Low

### Quick Wins
1. Add "Order Status" label to dropdown (2 minutes)
2. Add error icon to validation messages (5 minutes)
3. Increase cancel button border color contrast (1 minute)

### Testing Recommendations
- [ ] Verify form is fully navigable via keyboard only (Tab, Enter, Escape)
- [ ] Test with screen reader (NVDA or JAWS on Windows, VoiceOver on Mac)
- [ ] Verify focus indicators visible on all interactive elements
- [ ] Test with Windows High Contrast Mode
- [ ] Use browser extension (axe, WAVE) to catch common issues
- [ ] Verify error messages announced when they appear
```

## Common Accessibility Patterns

### Status Indicators
```
❌ Bad: Color-only badge (red = cancelled, green = delivered)
✅ Good: Color + text badge ("Cancelled" text, not just red background)
```

### Icon Buttons
```
❌ Bad: Icon with no label (🗑️ trash icon alone)
✅ Good: Icon with accessible label (aria-label="Delete order" or visible text)
```

### Form Validation
```
❌ Bad: Field border turns red on error
✅ Good: Red border + error icon + error text below field + aria-describedby
```

### Loading States
```
❌ Bad: Spinner with no text
✅ Good: Spinner + "Loading orders..." text + aria-live region
```

### Disabled Buttons
```
❌ Bad: Button disabled with no explanation
✅ Good: Button enabled with validation errors shown OR disabled with clear reason
```

## Integration with Other Skills

- Run during **figma-flow-analysis** to catch issues early
- Include findings in **ui-consistency-review**
- Flag blockers in **refinement-validator**
- Document in **handoff-pack-writer** risks section
- Apply **prototype-humanizer** to explain issues to non-technical stakeholders

## Resources

- **WCAG 2.1**: Official accessibility guidelines (Level AA is target)
- **WebAIM Contrast Checker**: Tool for testing color contrast
- **Keyboard Testing**: Tab, Enter, Space, Escape, Arrow keys
- **Screen Readers**: NVDA (free, Windows), VoiceOver (free, Mac), JAWS (paid, Windows)
- **Browser Extensions**: axe DevTools, WAVE, Lighthouse

## Success Criteria

An accessibility review should:
- Identify real barriers users will encounter
- Prioritize issues by user impact
- Provide specific, actionable recommendations
- Explain accessibility in usability terms
- Enable the team to make informed trade-offs
