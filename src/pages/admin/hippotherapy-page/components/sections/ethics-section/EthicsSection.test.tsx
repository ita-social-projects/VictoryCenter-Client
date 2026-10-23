import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EthicsSection, EthicsSectionProps } from './EthicsSection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippotherapyEthicsSectionContent } from '@/types/admin/hippotherapy-page';
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

describe('EthicsSection', () => {
    let mockOnChange: jest.Mock;

    const validateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

    const defaultValue: HippotherapyEthicsSectionContent = {
        title: 'Initial title',
        description: 'Initial description',
        principles: ['Principle one', 'Principle two'],
        image: null,
        imageId: null,
    };

    const renderComponent = (props: Partial<EthicsSectionProps> = {}) =>
        render(<EthicsSection value={defaultValue} onChange={mockOnChange} {...props} />);

    beforeEach(() => {
        mockOnChange = jest.fn();
        validateTextMock().mockReset();
        validateTextMock().mockReturnValue(undefined);
    });

    it('renders title, image, description, and one field per principle', () => {
        renderComponent();

        expect(screen.getByText(COMMON_TEXT_ADMIN.TYPE.TITLE)).toBeInTheDocument();
        expect(screen.getAllByText(COMMON_TEXT_ADMIN.TYPE.DESCRIPTION)).toHaveLength(3);
        expect(screen.getByTestId('mock-rich-input-hippotherapy-ethics-principle-0')).toHaveValue('Principle one');
    });

    runsSectionImageInputTests(renderComponent, defaultValue, () => mockOnChange);

    runsSectionFieldUpdateTests(renderComponent, defaultValue, () => mockOnChange, [
        {
            testId: 'mock-rich-input-hippotherapy-ethics-title',
            fieldName: 'title',
            label: 'title',
            newValue: 'New title',
        },
        {
            testId: 'mock-rich-input-hippotherapy-ethics-description',
            fieldName: 'description',
            label: 'description',
            newValue: 'New description',
        },
    ]);

    it('updates only the targeted principle, leaving others intact', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippotherapy-ethics-principle-1'), {
            target: { value: 'Updated principle two' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({
            ...defaultValue,
            principles: ['Principle one', 'Updated principle two'],
        });
    });

    it('shows a per-principle validation error', () => {
        validateTextMock().mockReturnValueOnce('Too short');
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippotherapy-ethics-principle-0'), {
            target: { value: 'x' },
        });
        fireEvent.blur(screen.getByTestId('mock-rich-input-hippotherapy-ethics-principle-0'));

        expect(screen.getByText('Too short')).toBeInTheDocument();
    });

    runsSectionDisablesInputsTest(
        renderComponent,
        [
            'mock-image-input-file',
            'mock-rich-input-hippotherapy-ethics-title',
            'mock-rich-input-hippotherapy-ethics-description',
            'mock-rich-input-hippotherapy-ethics-principle-0',
        ],
        'disables every input when disabled is true',
    );

    runsSectionTranslationHeaderTests(
        renderComponent,
        (onTranslateClick) => ({ onTranslateClick }),
        (onTranslateClick) => ({ onTranslateClick, isTranslateDisabled: true }),
    );
});
