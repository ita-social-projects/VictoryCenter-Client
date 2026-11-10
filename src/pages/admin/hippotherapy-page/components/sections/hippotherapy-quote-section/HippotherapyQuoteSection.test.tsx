import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HippotherapyQuoteSection, HippotherapyQuoteSectionProps } from './HippotherapyQuoteSection';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HippotherapyQuoteContent } from '@/types/admin/hippotherapy-page';
import {
    itHidesToolbarWhenReadOnly,
    itRendersTranslationStatuses,
} from '@/utils/mock-data/admin/section-translation-test-helpers';
import {
    getValidateTextMock,
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

describe('HippotherapyQuoteSection', () => {
    setupValidateTextMock();

    const QUOTE_ID = 'mock-rich-input-test-quote-quote-text';
    const AUTHOR_ID = 'mock-rich-input-test-quote-quote-author';

    const defaultValue: HippotherapyQuoteContent = {
        quoteText: 'Initial quote',
        authorName: 'Initial author',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<HippotherapyQuoteSectionProps> = {}, isReadOnly = false) =>
        render(
            <HippotherapyReadOnlyContext.Provider value={isReadOnly}>
                <HippotherapyQuoteSection
                    value={defaultValue}
                    onChange={jest.fn()}
                    fieldIdPrefix="test-quote"
                    {...props}
                />
                ,
            </HippotherapyReadOnlyContext.Provider>,
        );

    it('renders the quote text and author name fields', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByText(HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId(QUOTE_ID)).toHaveValue('Initial quote');
        expect(screen.getByTestId(AUTHOR_ID)).toHaveValue('Initial author');
    });

    itHandlesImageField(renderComponent, defaultValue);
    itUpdatesFieldsOnChange(renderComponent, defaultValue, [
        { testId: QUOTE_ID, field: 'quoteText', value: 'New quote' },
        { testId: AUTHOR_ID, field: 'authorName', value: 'New author' },
    ]);

    it('does not show an error for an empty author name on blur', () => {
        getValidateTextMock().mockReturnValue('Too short');
        renderComponent({ value: { ...defaultValue, authorName: '' } });

        fireEvent.blur(screen.getByTestId(AUTHOR_ID));

        expect(screen.queryByText('Too short')).not.toBeInTheDocument();
    });

    itShowsValidationErrorOnBlur(renderComponent, AUTHOR_ID);
    itDisablesInputsWhenDisabled(renderComponent, [QUOTE_ID, AUTHOR_ID]);

    describe('translate button', () => {
        itSupportsTranslateButton(renderComponent);
    });

    describe('translation statuses', () => {
        itRendersTranslationStatuses(renderComponent);
    });

    describe('read-only toolbar', () => {
        itHidesToolbarWhenReadOnly(
            (isReadOnly) => renderComponent({}, isReadOnly),
            ['mock-rich-input-test-quote-quote-text', 'mock-rich-input-test-quote-quote-author'],
        );
    });
});
