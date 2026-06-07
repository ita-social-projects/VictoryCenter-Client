# TS37: Scientific Research Tests

## Implements
**Business Stories**: BS08 - Scientific Research Management

## Test Cases (14 tests)
- Form renders (generalText + research entries array)
- Rich text validation for generalText
- Add research entry functionality
- Remove research entry functionality
- Research entry field validation (title, description, link, optional image)
- URL validation for links
- Min/max array length validation (1-20 entries)
- Form submission with array
- Publish/draft workflows
- Toast notifications
- Translation integration

## Dependencies
- TS18: ScientificResearchSection component
- TS19: ResearchEntryForm component

## Estimated Effort
**4 hours**

## Definition of Done
- [ ] All tests passing (>90% coverage)
- [ ] Array operations tested
- [ ] URL validation tested
