# TS31: What Is Hippotherapy Tests

## Implements
**Business Stories**: BS02 - What Is Hippotherapy Content

## Technical Goal
Integration tests for What Is Hippotherapy section with rich text editor validation.

## Acceptance Criteria
- [ ] Form renders with heading, rich text description, image
- [ ] Rich text editor validation (required, max length)
- [ ] Rich text formatting preserved on save
- [ ] Form submission works end-to-end
- [ ] Publish/draft workflows tested

## Test Cases (10 tests)
- Form renders correctly
- Pre-fills with existing data
- Heading validation
- Rich text description validation
- Image validation
- Form submission with valid data
- Publish button works
- Draft button works
- Success/error toasts
- Translation integration

## Dependencies
- TS09: WhatIsHippotherapySection component

## Estimated Effort
**2 hours**

## Definition of Done
- [ ] All tests passing (>90% coverage)
