# TS41: Scientific Research General Translation Modal

## Implements
**Business Stories**: BS08 - Scientific Research Management

## Technical Goal
Create translation modal for scientific research section general text field.

## Acceptance Criteria
- [ ] Modal extends TranslationModalBase
- [ ] Modal contains rich text generalText field
- [ ] Modal validates general text
- [ ] Modal saves on submit

## Implementation Details

```typescript
<TextInputField
  name="generalText"
  control={form.control}
  label="General Text"
  required
  richText
  maxLength={5000}
  error={form.formState.errors.generalText}
/>
```

## Dependencies
- TS26, TS16

## Estimated Effort
**3 hours**

## Definition of Done
- [ ] Modal complete
- [ ] Tests passing
