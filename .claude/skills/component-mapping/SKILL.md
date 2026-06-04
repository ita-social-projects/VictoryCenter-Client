# component-mapping

## Purpose

Explain relationships between design components, implementation components, and reusable UI patterns to clarify implementation boundaries and component ownership.

## When to Use This Skill

- Understanding how Figma components map to code structure
- Planning component architecture for new features
- Identifying component reuse opportunities
- Refactoring UI code to reduce duplication
- Explaining to designers why one Figma component might become multiple code components
- Documenting component hierarchies and dependencies

## Key Principle

⚠️ **A Figma component does NOT automatically equal one code component**

Design tools and code have different optimization goals:
- **Figma**: Visual consistency, design system maintainability, designer workflow
- **Code**: Reusability, data flow, state management, performance, maintainability

## Responsibilities

- Detect reusable component structures in designs
- Identify component duplication (same UI pattern in multiple places)
- Explain implementation boundaries (what should be one component vs. multiple)
- Clarify state ownership (where data lives, how it flows)
- Map component relationships (parent/child, composition, variants)
- Distinguish between presentational and container components

## Mapping Patterns

### One-to-One Mapping
A design component directly corresponds to a code component.

**Example**:
- **Design**: "Primary Button" component
- **Code**: `<Button variant="primary">` component
- **Relationship**: Direct mapping, component props control visual variant

### One-to-Many Mapping
A single design element becomes multiple code components.

**Example**:
- **Design**: "Order Card" (single Figma component)
- **Code**: 
  - `<OrderCard>` (container, handles layout)
  - `<StatusBadge>` (displays order status)
  - `<OrderDetails>` (displays line items)
  - `<OrderActions>` (action buttons)
- **Reason**: Each sub-component is reusable in other contexts

### Many-to-One Mapping
Multiple design components use a single code component with different props.

**Example**:
- **Design**: "Success Alert", "Warning Alert", "Error Alert" (separate Figma components)
- **Code**: `<Alert severity="success|warning|error">` (single component)
- **Reason**: Code consolidates variants through props rather than separate components

### Composite Pattern
Design shows a unified element; code builds it from multiple smaller components.

**Example**:
- **Design**: "Product Selector" (appears as single widget)
- **Code**:
  - `<SearchInput>` (text input with icon)
  - `<ProductList>` (scrollable results)
  - `<ProductListItem>` (individual product)
  - `<AddToOrderButton>` (action)
  - `<ProductSelector>` (parent that composes them all)
- **Reason**: Each piece has independent logic and reuse potential

## Component Classification

### Presentational Components
- Concerned with how things look
- Receive data via props
- Don't manage application state
- Typically reusable across features

**Examples**: `<Button>`, `<StatusBadge>`, `<FormInput>`

### Container Components
- Concerned with how things work
- Fetch data, manage state
- Pass data to presentational components
- Typically feature-specific

**Examples**: `<OrderListContainer>`, `<OrderEditFormContainer>`

### Hybrid Components
- Mix presentation and logic
- Common for forms, complex widgets
- May need refactoring if reused

**Examples**: `<OrderEditForm>` (has both UI and validation logic)

## Analysis Process

1. **Inventory Design Components**: List distinct components in the mockup
2. **Identify Reuse Patterns**: Note where same visual patterns appear
3. **Assess Logical Boundaries**: Determine natural component splits
4. **Map Data Flow**: Identify where data comes from, where it's transformed
5. **Detect State Ownership**: Clarify which component owns which piece of state
6. **Recommend Structure**: Suggest component hierarchy and relationships

## Output Format

### Component Map

For each design component:
- **Design Component**: Name from mockup
- **Code Implementation**: Component name(s) and file location(s)
- **Mapping Type**: One-to-one / One-to-many / Many-to-one / Composite
- **Component Type**: Presentational / Container / Hybrid
- **Props**: Key props the component accepts
- **State Ownership**: Where component gets its data
- **Reuse Potential**: Where else this could be used

### Component Hierarchy
Visual representation of parent-child relationships.

### Reuse Opportunities
Specific suggestions for consolidation or extraction.

## Rules

- ✅ Explain in plain language, avoid excessive framework jargon
- ✅ Use concrete examples from the codebase when available
- ✅ Distinguish between "could be extracted" vs. "should be extracted"
- ✅ Consider both code reuse and logic reuse
- ✅ Note when Figma structure doesn't match optimal code structure
- ❌ Don't assume Figma component hierarchy dictates code hierarchy
- ❌ Don't over-engineer — not everything needs to be a separate component
- ❌ Don't ignore practical constraints (team familiarity, time, refactoring cost)

## Example Component Mapping

```markdown
## Component Mapping: Order Edit Screen

### Design Component: "Order Status Selector"
**Code Implementation**: 
- `<OrderStatusDropdown>` (app/orders/[id]/edit/OrderStatusDropdown.tsx)
- Uses MUI `<Select>` component internally
- Renders `<StatusBadge>` for each option

**Mapping Type**: Composite
**Component Type**: Hybrid (presentation + validation logic)

**Props**:
```typescript
{
  currentStatus: OrderStatus;
  availableStatuses: OrderStatus[];
  onChange: (newStatus: OrderStatus) => void;
  disabled?: boolean;
}
```

**State Ownership**: 
- Available statuses determined by business rules (service layer)
- Current status from order object (parent component)
- Validation errors managed internally

**Reuse Potential**: 
- Could be used on order list for bulk status updates
- Status transition logic should be extracted to shared utility

---

### Design Component: "Discount Input"
**Code Implementation**: 
- `<DiscountField>` (new component to create)
- Uses MUI `<TextField>` with type="number"
- Includes validation display

**Mapping Type**: One-to-one with validation wrapper
**Component Type**: Presentational (receives validation errors from parent)

**Props**:
```typescript
{
  value: number;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
}
```

**State Ownership**: 
- Value managed by parent form
- Validation performed by parent (20% threshold rule)

**Reuse Potential**: 
- Generic enough to be used for any percentage input
- Consider making a shared `<PercentageInput>` component

---

### Component Hierarchy
```
<OrderEditForm>                    [Container/Hybrid]
├── <OrderStatusDropdown>          [Hybrid]
│   └── <StatusBadge> (reused)     [Presentational]
├── <DiscountField>                [Presentational]
├── <ManagerNoteTextarea>          [Presentational]
└── <FormActions>                  [Presentational]
    ├── <Button variant="text">    [Presentational, from MUI]
    └── <Button variant="contained"> [Presentational, from MUI]
```

---

### Reuse Opportunities

**Identified Patterns**:
1. **Status Badge**: Already used in order list, can reuse in dropdown options
2. **Form Action Buttons**: "Cancel" + "Save" pattern appears in multiple forms
   - **Recommendation**: Extract `<FormActions>` component with standard layout
3. **Percentage Validation**: Discount field has validation logic
   - **Recommendation**: Extract validation to shared utility function

**Refactoring Suggestions**:
- Extract `<FormActions>` from edit form (low effort, high reuse value)
- Create shared `discountValidation()` utility (used in form and API)
- Consider whether `<ManagerNoteTextarea>` could be generic `<Textarea>` component

---

### Implementation Boundaries

**Why OrderStatusDropdown is its own component**:
- Encapsulates status transition logic
- Handles status-specific styling (colors, icons)
- Reusable in other order management contexts
- Complex enough to test independently

**Why DiscountField might not need its own file**:
- Simple wrapper around TextField
- No complex logic (validation is in parent)
- Not reused elsewhere (yet)
- Could stay inline in form until second usage emerges

**Rule of thumb**: Extract when:
- Component is reused in 2+ places
- Component has complex logic worth isolating
- Component needs independent testing
- Component improves readability of parent
```

## Advanced Scenarios

### Variant vs. Separate Component

**Question**: Should "PrimaryButton" and "SecondaryButton" be separate components or one component with a prop?

**Analysis**:
- **Same behavior, different appearance** → Use variant prop
- **Different behavior** → Separate components
- **Example**: `<Button variant="primary|secondary">` is better than `<PrimaryButton>` + `<SecondaryButton>`

### When to Compose vs. Extend

**Composition** (preferred):
```tsx
<Dialog>
  <DialogTitle>Confirm Cancellation</DialogTitle>
  <DialogContent>Are you sure?</DialogContent>
  <DialogActions>
    <Button>Cancel</Button>
    <Button>Confirm</Button>
  </DialogActions>
</Dialog>
```

**Extension** (use sparingly):
```tsx
<ConfirmCancelDialog onConfirm={handleConfirm} />
```

**Guideline**: Prefer composition unless pattern is repeated 3+ times with same structure.

### State Lifting

If multiple components need the same state, lift it to their common parent.

**Example**: 
- **Problem**: Both `<OrderDetails>` and `<OrderEditForm>` need order data
- **Solution**: Lift state to `<OrderPage>`, pass as props to both

## Integration with Other Skills

- Run alongside **design-to-code-scout** for implementation planning
- Use findings in **handoff-pack-writer** to document component structure
- Inform **ui-consistency-review** about component reuse opportunities
- Apply **prototype-humanizer** to explanations for designers

## Success Criteria

Good component mapping enables:
- Clear understanding of implementation structure
- Identification of reuse opportunities
- Informed decisions about component granularity
- Better communication between design and development
- Reduced code duplication
- Maintainable component architecture
