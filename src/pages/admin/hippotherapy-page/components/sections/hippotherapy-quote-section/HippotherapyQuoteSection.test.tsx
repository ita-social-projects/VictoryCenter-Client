import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HippotherapyQuoteSection, HippotherapyQuoteSectionProps } from './HippotherapyQuoteSection';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippotherapyQuoteContent } from '@/types/admin/hippotherapy-page';
import {
    runsSectionImageInputTests,
    runsSectionFieldUpdateTests,
    runsSectionDisablesInputsTest,
    runsSectionTranslationHeaderTests,
} from '../test-utils/sectionTestHelpers';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');

jest.mock('@/components/admin/image-input/ImageInput');
jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('HippotherapyQuoteSection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippotherapyQuoteContent = {
        quoteText: 'Initial quote',
        authorName: 'Initial author',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<HippotherapyQuoteSectionProps> = {}) =>
        render(
            <HippotherapyQuoteSection
                value={defaultValue}
                onChange={mockOnChange}
                fieldIdPrefix="test-quote"
                {...props}
            />,
        );

    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders the quote text and author name fields', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByText(HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId('mock-rich-input-test-quote-quote-text')).toHaveValue('Initial quote');
        expect(screen.getByTestId('mock-rich-input-test-quote-quote-author')).toHaveValue('Initial author');
    });

    runsSectionImageInputTests(renderComponent, defaultValue, () => mockOnChange);

    runsSectionFieldUpdateTests(renderComponent, defaultValue, () => mockOnChange, [
        {
            testId: 'mock-rich-input-test-quote-quote-text',
            fieldName: 'quoteText',
            label: 'quote text',
            newValue: 'New quote',
        },
        {
            testId: 'mock-rich-input-test-quote-quote-author',
            fieldName: 'authorName',
            label: 'author name',
            newValue: 'New author',
        },
    ]);

    it('does not show an error for an empty author name on blur', () => {
        validateTextMock().mockReturnValue('Too short');
        renderComponent({ value: { ...defaultValue, authorName: '' } });

        fireEvent.blur(screen.getByTestId('mock-rich-input-test-quote-quote-author'));

        expect(screen.queryByText('Too short')).not.toBeInTheDocument();
    });

    it('shows an error for a filled but invalid author name on blur', () => {
        validateTextMock().mockReturnValueOnce('Too short');
        renderComponent();

        fireEvent.blur(screen.getByTestId('mock-rich-input-test-quote-quote-author'));

        expect(screen.getByText('Too short')).toBeInTheDocument();
    });

    runsSectionDisablesInputsTest(renderComponent, [
        'mock-image-input-file',
        'mock-rich-input-test-quote-quote-text',
        'mock-rich-input-test-quote-quote-author',
    ]);

    runsSectionTranslationHeaderTests(
        renderComponent,
        (onTranslateClick) => ({ onTranslateClick }),
        (onTranslateClick) => ({ onTranslateClick, isTranslateDisabled: true }),
    );
});
