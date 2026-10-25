import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HippoventionCenterSection, HippoventionCenterSectionProps } from './HippoventionCenterSection';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HippoventionCenterSectionContent } from '@/types/admin/hippotherapy-page';
import { itRendersTranslationStatuses } from '@/utils/mock-data/admin/section-translation-test-helpers';
import {
    itDisablesInputsWhenDisabled,
    itHandlesImageField,
    itShowsValidationErrorOnBlur,
    itSupportsTranslateButton,
    itUpdatesFieldsOnChange,
    setupValidateTextMock,
} from '@/utils/mock-data/admin/hippotherapy-section-test-helpers';

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses');
jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');
jest.mock('@/components/admin/image-input/ImageInput');
jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema');

describe('HippoventionCenterSection', () => {
    setupValidateTextMock();

    const TITLE_ID = 'mock-rich-input-hippovention-center-title';
    const PROS_ID = 'mock-rich-input-hippovention-center-pros';
    const DESCRIPTION_ID = 'mock-rich-input-hippovention-center-description';

    const defaultValue: HippoventionCenterSectionContent = {
        title: 'Initial title',
        description: 'Initial description',
        pros: 'Initial pros',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<HippoventionCenterSectionProps> = {}) =>
        render(<HippoventionCenterSection value={defaultValue} onChange={jest.fn()} {...props} />);

    it('renders title, image, pros, and description', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByText(HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId(PROS_ID)).toHaveValue('Initial pros');
    });

    itHandlesImageField(renderComponent, defaultValue);
    itUpdatesFieldsOnChange(renderComponent, defaultValue, [
        { testId: TITLE_ID, field: 'title', value: 'New title' },
        { testId: PROS_ID, field: 'pros', value: 'Updated pros' },
        { testId: DESCRIPTION_ID, field: 'description', value: 'New description' },
    ]);
    itShowsValidationErrorOnBlur(renderComponent, PROS_ID, 'x');
    itDisablesInputsWhenDisabled(renderComponent, [TITLE_ID, PROS_ID, DESCRIPTION_ID]);

    describe('translate button', () => {
        itSupportsTranslateButton(renderComponent);
    });

    describe('translation statuses', () => {
        itRendersTranslationStatuses(renderComponent);
    });
});
