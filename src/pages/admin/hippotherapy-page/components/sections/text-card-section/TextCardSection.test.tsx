import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextCardSection, TextCardSectionProps } from './TextCardSection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippotherapyTextCardContent } from '@/types/admin/hippotherapy-page';
import {
    itRendersTranslationStatuses,
    itHidesToolbarWhenReadOnly,
} from '@/utils/mock-data/admin/section-translation-test-helpers';
import { HippotherapyReadOnlyContext } from '../../../context/HippotherapyReadOnlyContext';

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses');

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('TextCardSection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippotherapyTextCardContent = {
        title: 'Initial title',
        description: 'Initial description',
    };

    const renderComponent = (props: Partial<TextCardSectionProps> = {}, isReadOnly = false) =>
        render(
            <HippotherapyReadOnlyContext.Provider value={isReadOnly}>
                <TextCardSection value={defaultValue} onChange={mockOnChange} fieldIdPrefix="test-card" {...props} />
            </HippotherapyReadOnlyContext.Provider>,
        );
    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders the initial title and description', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId('mock-rich-input-test-card-title')).toHaveValue('Initial title');
        expect(screen.getByTestId('mock-rich-input-test-card-description')).toHaveValue('Initial description');
    });

    it('calls onChange with the updated title', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-test-card-title'), { target: { value: 'New title' } });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, title: 'New title' });
    });

    it('calls onChange with the updated description', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-test-card-description'), {
            target: { value: 'New description' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, description: 'New description' });
    });

    it('shows a validation error when title validation fails', () => {
        validateTextMock().mockReturnValueOnce('Too short');
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-test-card-title'), { target: { value: 'x' } });
        fireEvent.blur(screen.getByTestId('mock-rich-input-test-card-title'));

        expect(screen.getByText('Too short')).toBeInTheDocument();
    });

    it('disables inputs when disabled is true', () => {
        renderComponent({ disabled: true });

        expect(screen.getByTestId('mock-rich-input-test-card-title')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-test-card-description')).toBeDisabled();
    });

    describe('translation statuses', () => {
        itRendersTranslationStatuses(renderComponent);
    });

    describe('read-only toolbar', () => {
        itHidesToolbarWhenReadOnly(
            (isReadOnly) => renderComponent({}, isReadOnly),
            ['mock-rich-input-test-card-title', 'mock-rich-input-test-card-description'],
        );
    });
});
