import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroBannerSection, IntroBannerSectionProps } from './IntroBannerSection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HippotherapyIntroSectionContent } from '@/types/admin/hippotherapy-page';
import {
    itHidesToolbarWhenReadOnly,
    itRendersTranslationStatuses,
} from '@/utils/mock-data/admin/section-translation-test-helpers';
import {
    itDisablesInputsWhenDisabled,
    itHandlesImageField,
    itShowsValidationErrorOnBlur,
    itSupportsTranslateButton,
    itUpdatesFieldsOnChange,
    setupValidateTextMock,
} from '@/utils/mock-data/admin/hippotherapy-section-test-helpers';
import { HippotherapyReadOnlyContext } from '../../../context/HippotherapyReadOnlyContext';

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses');
jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');
jest.mock('@/components/admin/image-input/ImageInput');
jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema');

describe('IntroBannerSection', () => {
    setupValidateTextMock();

    const TITLE_ID = 'mock-rich-input-hippotherapy-intro-title';
    const DESCRIPTION_ID = 'mock-rich-input-hippotherapy-intro-description';

    const defaultValue: HippotherapyIntroSectionContent = {
        title: 'Initial title',
        description: 'Initial description',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<IntroBannerSectionProps> = {}, isReadOnly = false) =>
        render(
            <HippotherapyReadOnlyContext.Provider value={isReadOnly}>
                <IntroBannerSection value={defaultValue} onChange={jest.fn()} {...props} />
            </HippotherapyReadOnlyContext.Provider>,
        );

    it('renders the initial title and description', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId(TITLE_ID)).toHaveValue('Initial title');
        expect(screen.getByTestId(DESCRIPTION_ID)).toHaveValue('Initial description');
    });

    itHandlesImageField(renderComponent, defaultValue);
    itUpdatesFieldsOnChange(renderComponent, defaultValue, [
        { testId: TITLE_ID, field: 'title', value: 'New title' },
        { testId: DESCRIPTION_ID, field: 'description', value: 'New description' },
    ]);
    itShowsValidationErrorOnBlur(renderComponent, TITLE_ID, 'x');
    itDisablesInputsWhenDisabled(renderComponent, [TITLE_ID, DESCRIPTION_ID]);

    describe('translate button', () => {
        itSupportsTranslateButton(renderComponent);
    });

    describe('translation statuses', () => {
        itRendersTranslationStatuses(renderComponent);
    });

    describe('read-only toolbar', () => {
        itHidesToolbarWhenReadOnly(
            (isReadOnly) => renderComponent({}, isReadOnly),
            ['mock-rich-input-hippotherapy-intro-title', 'mock-rich-input-hippotherapy-intro-description'],
        );
    });
});
