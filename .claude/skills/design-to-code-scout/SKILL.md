# design-to-code-scout

## Purpose

Connect Figma structures to repository implementation by mapping design elements to code components, identifying reusable patterns, and explaining implementation impact.

## When to Use This Skill

- Planning implementation based on Figma mockups
- Estimating effort for UI changes
- Identifying reusable components or patterns
- Detecting duplicated UI logic that could be consolidated
- Explaining to designers how their designs map to code structure
- Creating traceability between design and implementation

## Responsibilities

- Map design elements to existing code components
- Find reusable implementation patterns in the codebase
- Detect duplicated UI logic that could be refactored
- Identify implementation impact (new components vs. modifications)
- Explain component hierarchy and data flow
- Assess technical feasibility of design proposals

## Mapping Process

1. **Inventory Design Elements**: List distinct UI elements in the mockup
2. **Locate Existing Components**: Search codebase for matching or similar components
3. **Assess Reusability**: Determine if existing components can be reused, extended, or must be created new
4. **Trace Data Flow**: Identify where data comes from and how it flows to UI
5. **Estimate Impact**: Classify changes as new, modified, or reused

## Output Format

### Design-to-Code Mapping

For each major design element, provide:
- **Design Element**: Name/description from mockup
- **Code Location**: File path and component name (if exists)
- **Reuse Assessment**: Can reuse as-is / needs modification / create new
- **Data Source**: Where the data comes from (API, props, state)
- **Implementation Notes**: Specific considerations

### Impact Summary
- **New Components**: What needs to be built from scratch
- **Modified Components**: What existing components need changes
- **Reused Components**: What can be used as-is
- **Technical Risks**: Potential implementation challenges

## Rules

- ✅ Explain mapping in plain language, avoid excessive jargon
- ✅ Focus on traceability between design and code
- ✅ Identify opportunities to consolidate similar UI patterns
- ✅ Consider both component reuse and logic reuse
- ✅ Mention potential technical constraints early
- ❌ Don't assume one Figma component = one code component
- ❌ Don't provide line-by-line code unless specifically requested
- ❌ Don't overwhelm with implementation details if high-level mapping suffices

## Example Mapping

```markdown
## Design-to-Code Mapping: Order Edit Screen

### Status Dropdown
**Design Element**: Dropdown showing order statuses with color-coded badges
**Code Location**: 
- Component: `app/orders/[id]/edit/OrderEditForm.tsx` (form)
- Status Badge: Likely reuses badge from order list
**Reuse Assessment**: 
- Dropdown: Needs to be created (MUI Select component)
- Status Badge: Can reuse existing component
**Data Source**: 
- Available statuses: From business rules or API
- Current status: Order object from database
**Implementation Notes**: 
- Need validation to block invalid status transitions
- Badge colors should match order list for consistency

### Discount Input Field
**Design Element**: Percentage input with validation message
**Code Location**: New — no existing discount field in app
**Reuse Assessment**: Create new
**Data Source**: Order.discountPercent field (needs validation)
**Implementation Notes**: 
- Validation: >20% requires manager note (existing business rule)
- Calculate discounted total in real-time
- Consider accessibility: percentage vs. decimal input format

### Manager Note Textarea
**Design Element**: Multi-line text field for internal notes
**Code Location**: New component in edit form
**Reuse Assessment**: Standard MUI TextField with multiline prop
**Data Source**: Order.managerNotes field (may need to be added to schema)
**Implementation Notes**: 
- Character limit? Not specified in mockup
- Should notes be versioned/appended or overwritten?

### Timeline Component
**Design Element**: Status change history on right panel
**Code Location**: Check if order detail page has similar component
**Reuse Assessment**: If exists, reuse; if not, significant new component
**Data Source**: Order status history (audit log)
**Implementation Notes**: 
- May require new data structure to track status change history
- Consider performance if history is long

### Impact Summary

**New Components**:
- Status dropdown (MUI Select with validation)
- Discount input field with real-time calculation
- Manager note textarea
- Timeline component (if doesn't exist)

**Modified Components**:
- Order detail page (add "Edit" button)
- Order service (add status transition validation)
- Order schema (add discountPercent, managerNotes fields)

**Reused Components**:
- Status badge (from order list)
- Button components (MUI)
- Form layout patterns

**Technical Risks**:
- Status history tracking not currently implemented — may require database migration
- Real-time total calculation requires consistent rounding logic
- Concurrent edit handling not addressed (what if two managers edit same order?)
```

## Advanced Mapping Scenarios

### Component Variants
A single design component might map to multiple code components:
- **Example**: A "user card" in design might use `CustomerCard`, `ManagerCard`, or `AdminCard` in code depending on role
- **Approach**: Map to base component or shared interface, note variants

### Composite Components
A design element might be built from multiple smaller code components:
- **Example**: A "product selector" might combine `SearchInput`, `ProductList`, `ProductItem`, and `AddButton`
- **Approach**: Break down into component hierarchy, note composition

### Shared Logic
Design elements that look different but share implementation:
- **Example**: Order filtering and customer filtering might use same filter logic with different field names
- **Approach**: Identify shared utilities, suggest abstraction

## Integration with Other Skills

- Run **after** **figma-flow-analysis** and **ui-consistency-review**
- Use findings to inform **refinement-validator** about technical complexity
- Feed mapping into **handoff-pack-writer** for developer documentation
- Coordinate with **component-mapping** for detailed component relationships

## Success Criteria

A good design-to-code mapping enables:
- Accurate effort estimation
- Identification of technical risks early
- Clear implementation guidance for developers
- Informed decisions about design modifications
- Traceability from mockup to deployed feature
