# TS43: Principles Translation Modal

## Implements
**Business Stories**: BS10 - Hippotherapy Principles Section

## Technical Goal
Create translation modal for principles section (array of principles, each with heading and description).

## Acceptance Criteria
- [ ] Modal extends TranslationModalBase
- [ ] Modal displays array of principles
- [ ] Modal allows adding/removing principles
- [ ] Each principle: heading and description
- [ ] Modal validates all principles
- [ ] Modal saves principles array on submit

## Implementation Details

```typescript
// Similar to Testimonials but simpler (no images)
{fields.map((field, index) => (
  <Box key={field.id}>
    <TextInputField
      name={`principles.${index}.heading`}
      control={form.control}
      label={`Principle ${index + 1} Heading`}
      required
      maxLength={200}
    />
    <TextInputField
      name={`principles.${index}.description`}
      control={form.control}
      label={`Principle ${index + 1} Description`}
      required
      multiline
      rows={4}
      maxLength={1000}
    />
    <Button onClick={() => remove(index)}>Remove</Button>
  </Box>
))}
<Button onClick={() => append({ heading: '', description: '' })}>
  Add Principle
</Button>
```

## Dependencies
- TS26, TS16

## Estimated Effort
**3 hours**

## Definition of Done
- [ ] Modal complete
- [ ] Array management works
- [ ] Tests passing
