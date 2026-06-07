# TS40: Card Sections Translation Modal (Why/Who)

## Implements
**Business Stories**: BS06 - Why This Approach, BS09 - Who Programs Suit

## Technical Goal
Create translation modal for card sections with heading, description, and optional left/right images.

## Acceptance Criteria
- [ ] Modal extends TranslationModalBase
- [ ] Modal contains heading field (text)
- [ ] Modal contains rich text description field
- [ ] Modal contains optional imageLeft field
- [ ] Modal contains optional imageRight field
- [ ] Modal validates required fields
- [ ] Modal saves on submit

## Implementation Details

```typescript
// Similar to Set1TranslationModal but with two optional images
<ImageUploadField
  name="imageLeft"
  control={form.control}
  label="Left Image"
  required={false}
/>
<ImageUploadField
  name="imageRight"
  control={form.control}
  label="Right Image"
  required={false}
/>
```

## Dependencies
- TS26, TS15, TS16

## Estimated Effort
**4 hours**

## Definition of Done
- [ ] Modal complete with all fields
- [ ] Optional images work correctly
- [ ] Tests passing
