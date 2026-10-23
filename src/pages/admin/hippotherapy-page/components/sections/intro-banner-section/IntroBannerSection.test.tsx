import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntroBannerSection, IntroBannerSectionProps } from './IntroBannerSection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippotherapyIntroSectionContent } from '@/types/admin/hippotherapy-page';
import {
    runsSectionImageInputTests,
    runsSectionFieldUpdateTests,
    runsSectionDisablesInputsTest,
} from '../test-utils/sectionTestHelpers';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup');

jest.mock('@/components/admin/image-input/ImageInput');

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS: {
        validateText: jest.fn(() => undefined),
    },
}));

describe('IntroBannerSection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippotherapyIntroSectionContent = {
        title: 'Initial title',
        description: 'Initial description',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<IntroBannerSectionProps> = {}) =>
        render(<IntroBannerSection value={defaultValue} onChange={mockOnChange} {...props} />);

    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders the initial title and description', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId('mock-rich-input-hippotherapy-intro-title')).toHaveValue('Initial title');
        expect(screen.getByTestId('mock-rich-input-hippotherapy-intro-description')).toHaveValue('Initial description');
    });

    runsSectionImageInputTests(renderComponent, defaultValue, () => mockOnChange);

    runsSectionFieldUpdateTests(renderComponent, defaultValue, () => mockOnChange, [
        {
            testId: 'mock-rich-input-hippotherapy-intro-title',
            fieldName: 'title',
            label: 'title',
            newValue: 'New title',
        },
        {
            testId: 'mock-rich-input-hippotherapy-intro-description',
            fieldName: 'description',
            label: 'description',
            newValue: 'New description',
        },
    ]);

    it('shows a title validation error when validation fails', () => {
        validateTextMock().mockReturnValueOnce('Title is too short');
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippotherapy-intro-title'), {
            target: { value: 'x' },
        });
        fireEvent.blur(screen.getByTestId('mock-rich-input-hippotherapy-intro-title'));

        expect(screen.getByText('Title is too short')).toBeInTheDocument();
    });

    runsSectionDisablesInputsTest(
        renderComponent,
        [
            'mock-image-input-file',
            'mock-rich-input-hippotherapy-intro-title',
            'mock-rich-input-hippotherapy-intro-description',
        ],
        'disables inputs when disabled is true',
    );
});
