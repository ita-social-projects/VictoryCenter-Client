import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EthicsSection, EthicsSectionProps } from './EthicsSection';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HippotherapyEthicsSectionContent } from '@/types/admin/hippotherapy-page';

jest.mock('@/components/admin/image-input/ImageInput', () => ({
    ImageInput: require('@/utils/test-mocks/hippotherapy-page-mocks').MockImageInput,
}));

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    RichTextInputGroup: require('@/utils/test-mocks/hippotherapy-page-mocks').MockRichTextInputGroup,
}));

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

    it('calls onChange with the updated image', () => {
        renderComponent();

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, image: file });
    });

    it('shows an image error reported by ImageInput', () => {
        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: 'Set Error' }));

        expect(screen.getByText('image size error')).toBeInTheDocument();
    });

    it('reports the image error to the parent via onImageError', () => {
        const onImageError = jest.fn();
        renderComponent({ onImageError });

        fireEvent.click(screen.getByRole('button', { name: 'Set Error' }));

        expect(onImageError).toHaveBeenCalledWith('image size error');
    });

    it('calls onChange with the updated title', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippotherapy-ethics-title'), {
            target: { value: 'New title' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, title: 'New title' });
    });

    it('calls onChange with the updated description', () => {
        renderComponent();

        fireEvent.change(screen.getByTestId('mock-rich-input-hippotherapy-ethics-description'), {
            target: { value: 'New description' },
        });

        expect(mockOnChange).toHaveBeenCalledWith({ ...defaultValue, description: 'New description' });
    });

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

    it('disables every input when disabled is true', () => {
        renderComponent({ disabled: true });

        expect(screen.getByTestId('mock-image-input-file')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-hippotherapy-ethics-title')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-hippotherapy-ethics-description')).toBeDisabled();
        expect(screen.getByTestId('mock-rich-input-hippotherapy-ethics-principle-0')).toBeDisabled();
    });
});
