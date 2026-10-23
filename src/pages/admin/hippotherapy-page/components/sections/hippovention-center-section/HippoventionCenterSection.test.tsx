import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HippoventionCenterSection, HippoventionCenterSectionProps } from './HippoventionCenterSection';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippoventionCenterSectionContent } from '@/types/admin/hippotherapy-page';
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

describe('HippoventionCenterSection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippoventionCenterSectionContent = {
        title: 'Initial title',
        description: 'Initial description',
        pros: 'Initial pros',
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<HippoventionCenterSectionProps> = {}) =>
        render(<HippoventionCenterSection value={defaultValue} onChange={mockOnChange} {...props} />);

    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders title, image, pros, and description', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByText(HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION)).toBeInTheDocument();
        expect(screen.getByTestId('mock-rich-input-hippovention-center-pros')).toHaveValue('Initial pros');
    });

    runsSectionImageInputTests(renderComponent, defaultValue, () => mockOnChange);

    runsSectionFieldUpdateTests(renderComponent, defaultValue, () => mockOnChange, [
        {
            testId: 'mock-rich-input-hippovention-center-title',
            fieldName: 'title',
            label: 'title',
            newValue: 'New title',
        },
        {
            testId: 'mock-rich-input-hippovention-center-pros',
            fieldName: 'pros',
            label: 'pros text',
            newValue: 'Updated pros',
        },
        {
            testId: 'mock-rich-input-hippovention-center-description',
            fieldName: 'description',
            label: 'description',
            newValue: 'New description',
        },
    ]);

    it('shows a validation error when the pros text is invalid', () => {
        validateTextMock().mockReturnValueOnce('Too short');
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippovention-center-pros'), {
            target: { value: 'x' },
        });
        fireEvent.blur(screen.getByTestId('mock-rich-input-hippovention-center-pros'));

        expect(screen.getByText('Too short')).toBeInTheDocument();
    });

    runsSectionDisablesInputsTest(renderComponent, [
        'mock-image-input-file',
        'mock-rich-input-hippovention-center-title',
        'mock-rich-input-hippovention-center-pros',
        'mock-rich-input-hippovention-center-description',
    ]);
});
