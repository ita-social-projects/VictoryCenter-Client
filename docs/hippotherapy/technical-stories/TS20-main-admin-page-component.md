# TS20: Main Hippotherapy Admin Page Component

## Implements
**Business Stories**: 
- BS11 - Admin Page Integration

## Technical Goal
Create the main container page component that integrates all 10 hippotherapy section components, manages page-level state, handles publish/draft workflows, and provides navigation between sections.

## Acceptance Criteria
- [ ] Page renders all 10 section components in correct order
- [ ] Page manages global publish/draft state
- [ ] Page provides section navigation (tabs or accordion)
- [ ] Page handles unsaved changes warning on navigation
- [ ] Page integrates with authentication (protected route)
- [ ] Page displays loading state during initial data fetch
- [ ] Page displays error state if data fetch fails
- [ ] Page provides "Publish All" button at top
- [ ] Page provides "Save Draft" button at top
- [ ] Page shows toast notifications for success/error
- [ ] Page supports translation management for all sections
- [ ] Page includes breadcrumb navigation
- [ ] Page is responsive (mobile-friendly)
- [ ] Page tracks dirty state (unsaved changes)
- [ ] Page auto-saves drafts periodically (optional)

## Implementation Details

### Files to Create
- `src/pages/admin/hippotherapy/HippotherapyAdminPage.tsx`
- `src/pages/admin/hippotherapy/HippotherapyAdminPage.module.scss`
- `src/pages/admin/hippotherapy/HippotherapyAdminPage.test.tsx`
- `src/pages/admin/hippotherapy/index.ts`

### Code Example

**HippotherapyAdminPage.tsx**:
```typescript
import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Tabs, Tab, Button, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useHippotherapyAdmin } from '@/hooks/admin/use-hippotherapy-admin';
import { useToast } from '@/contexts/admin/toast-context-provider';
import { TitleSection } from '@/components/admin/hippotherapy/sections/title-section';
import { WhatIsHippotherapySection } from '@/components/admin/hippotherapy/sections/what-is-hippotherapy';
import { TestimonialsSection } from '@/components/admin/hippotherapy/sections/testimonials';
import { WhatIsIpoventiaSection } from '@/components/admin/hippotherapy/sections/what-is-ipoventia';
import { CenterOfIpoventiaSection } from '@/components/admin/hippotherapy/sections/center-of-ipoventia';
import { WhyThisApproachSection } from '@/components/admin/hippotherapy/sections/why-this-approach';
import { WhoProgramsSuitSection } from '@/components/admin/hippotherapy/sections/who-programs-suit';
import { ScientificResearchSection } from '@/components/admin/hippotherapy/sections/scientific-research';
import { PrinciplesSection } from '@/components/admin/hippotherapy/sections/principles';
import { ConfirmationModal } from '@/components/admin/hippotherapy/shared/confirmation-modal';
import { Breadcrumbs } from '@/components/admin/common/breadcrumbs';
import { HIPPOTHERAPY_SECTION_IDS } from '@/const/admin/hippotherapy-translation-constants';
import styles from './HippotherapyAdminPage.module.scss';

export const HippotherapyAdminPage: React.FC = () => {
  const { t } = useTranslation('hippotherapyAdmin');
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const {
    sections,
    loading,
    error,
    isDirty,
    publishAll,
    saveDraft,
    refetch,
  } = useHippotherapyAdmin();

  const [activeSection, setActiveSection] = useState(0);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingSection, setPendingSection] = useState<number | null>(null);

  useEffect(() => {
    // Auto-save draft every 2 minutes
    const autoSaveInterval = setInterval(() => {
      if (isDirty) {
        saveDraft();
        showToast(t('page.autoSaved'), 'info');
      }
    }, 120000);

    return () => clearInterval(autoSaveInterval);
  }, [isDirty, saveDraft, showToast, t]);

  const handleSectionChange = (newSection: number) => {
    if (isDirty) {
      setPendingSection(newSection);
      setShowUnsavedModal(true);
    } else {
      setActiveSection(newSection);
    }
  };

  const handleConfirmNavigation = () => {
    if (pendingSection !== null) {
      setActiveSection(pendingSection);
      setPendingSection(null);
    }
    setShowUnsavedModal(false);
  };

  const handlePublishAll = async () => {
    try {
      await publishAll();
      showToast(t('page.publishSuccess'), 'success');
    } catch (err) {
      showToast(t('page.publishError'), 'error');
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft();
      showToast(t('page.draftSaved'), 'success');
    } catch (err) {
      showToast(t('page.draftError'), 'error');
    }
  };

  if (loading) {
    return (
      <Box className={styles.loadingContainer}>
        <CircularProgress size={60} />
        <Typography variant="h6">{t('page.loading')}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className={styles.errorContainer}>
        <Typography variant="h6" color="error">
          {t('page.error')}
        </Typography>
        <Button variant="contained" onClick={refetch}>
          {t('page.retry')}
        </Button>
      </Box>
    );
  }

  const sectionComponents = [
    <TitleSection key="title" data={sections.title} />,
    <WhatIsHippotherapySection key="whatIs" data={sections.whatIsHippotherapy} />,
    <TestimonialsSection key="testimonials" data={sections.testimonials} />,
    <WhatIsIpoventiaSection key="whatIsIpo" data={sections.whatIsIpoventia} />,
    <CenterOfIpoventiaSection key="centerIpo" data={sections.centerOfIpoventia} />,
    <WhyThisApproachSection key="why" data={sections.whyThisApproach} />,
    <WhoProgramsSuitSection key="who" data={sections.whoProgramsSuit} />,
    <ScientificResearchSection key="research" data={sections.scientificResearch} />,
    <PrinciplesSection key="principles" data={sections.principles} />,
  ];

  return (
    <Container maxWidth="xl" className={styles.container}>
      <Breadcrumbs
        items={[
          { label: t('breadcrumbs.home'), path: '/admin-panel' },
          { label: t('breadcrumbs.hippotherapy'), path: '/admin-panel/hippotherapy' },
        ]}
      />

      <Box className={styles.header}>
        <Typography variant="h4">{t('page.title')}</Typography>
        <Box className={styles.actions}>
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            disabled={!isDirty || loading}
          >
            {t('page.saveDraft')}
          </Button>
          <Button
            variant="contained"
            onClick={handlePublishAll}
            disabled={loading}
          >
            {t('page.publishAll')}
          </Button>
        </Box>
      </Box>

      <Tabs
        value={activeSection}
        onChange={(_, newValue) => handleSectionChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        className={styles.tabs}
      >
        {Object.values(HIPPOTHERAPY_SECTION_IDS).map((sectionId, index) => (
          <Tab
            key={sectionId}
            label={t(`sections.${sectionId}`)}
            id={`section-tab-${index}`}
            aria-controls={`section-tabpanel-${index}`}
          />
        ))}
      </Tabs>

      <Box className={styles.content}>
        {sectionComponents[activeSection]}
      </Box>

      <ConfirmationModal
        open={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onConfirm={handleConfirmNavigation}
        title={t('page.unsavedChangesTitle')}
        message={t('page.unsavedChangesMessage')}
        variant="warning"
      />
    </Container>
  );
};
```

### Architecture Decisions
- Use Tabs for section navigation (better UX than accordion for 10 sections)
- Centralized state management via useHippotherapyAdmin hook
- Auto-save drafts every 2 minutes to prevent data loss
- Unsaved changes modal prevents accidental navigation
- Breadcrumbs for navigation context
- Lazy render only active section (performance optimization)

## Test Cases

### Unit Tests
- Test page renders all 10 section tabs
- Test clicking tab switches active section
- Test unsaved changes modal appears on navigation with dirty state
- Test Publish All button calls publishAll handler
- Test Save Draft button calls saveDraft handler
- Test loading state displays spinner
- Test error state displays error message and retry button
- Test breadcrumbs render correctly
- Test auto-save triggers after 2 minutes with dirty state
- Test accessibility: ARIA labels for tabs

### Integration Tests
- Test page integrates with useHippotherapyAdmin hook
- Test page integrates with toast context
- Test page protected by authentication
- Test navigation to page via React Router

## Dependencies

**Technical Dependencies**:
- TS01-TS19: Section components (must complete first)
- TS21: useHippotherapyAdmin hook (must complete first)
- TS17: ConfirmationModal (must complete first)

**Business Context**: BS11 - Admin Page Integration

## Estimated Effort

**8 hours**

- Page layout and structure: 2 hours
- Section integration: 2 hours
- State management integration: 1.5 hours
- Navigation and modals: 1.5 hours
- Auto-save and draft logic: 0.5 hours
- Test cases: 0.5 hours

## Technical Notes

### Patterns to Follow
- Follow existing Victory Center admin page patterns
- Use Material-UI layout components
- Use i18next for all strings
- Provide breadcrumbs for navigation

### Risks and Mitigation
- **Risk**: Large page with 10 sections causes performance issues
  - **Mitigation**: Lazy render only active section, virtualize if needed
- **Risk**: Auto-save conflicts with manual saves
  - **Mitigation**: Debounce auto-save, show indicator when auto-saving
- **Risk**: Navigation with unsaved changes loses data
  - **Mitigation**: Confirmation modal, auto-save drafts

### Performance Considerations
- Lazy load section components (only render active)
- Debounce auto-save to reduce API calls
- Memoize section data to prevent re-renders

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Page renders all 10 sections
- [ ] Navigation between sections works
- [ ] Unsaved changes warning works
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Accessibility tested
- [ ] Code reviewed and approved
- [ ] No lint warnings
