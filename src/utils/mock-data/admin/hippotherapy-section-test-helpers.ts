import { fireEvent, screen } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';

type RenderSection = (props?: any) => unknown;

export interface FieldChangeCase {
    testId: string;
    field: string;
    value: string;
}

const TRANSLATE_BUTTON_NAME = COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION;

export const getValidateTextMock = () => HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText as jest.Mock;

/** Call inside `describe`. Requires `jest.mock('@/validation/.../HippotherapyPageSchema')` in the test file. */
export const setupValidateTextMock = () => {
    beforeEach(() => {
        getValidateTextMock().mockReset();
        getValidateTextMock().mockReturnValue(undefined);
    });
};

export const itHandlesImageField = (renderComponent: RenderSection, defaultValue: object) => {
    it('calls onChange with the updated image', () => {
        const onChange = jest.fn();
        renderComponent({ onChange });
        const file = new File(['dummy'], 'test.png', { type: 'image/png' });

        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(onChange).toHaveBeenCalledWith({ ...defaultValue, image: file });
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
};

export const itUpdatesFieldsOnChange = (
    renderComponent: RenderSection,
    defaultValue: object,
    cases: FieldChangeCase[],
) => {
    it.each(cases)('calls onChange with the updated $field', ({ testId, field, value }) => {
        const onChange = jest.fn();
        renderComponent({ onChange });

        fireEvent.change(screen.getByTestId(testId), { target: { value } });

        expect(onChange).toHaveBeenCalledWith({ ...defaultValue, [field]: value });
    });
};

export const itDisablesInputsWhenDisabled = (renderComponent: RenderSection, testIds: string[]) => {
    it('disables all inputs when disabled is true', () => {
        renderComponent({ disabled: true });

        screen.getAllByTestId('mock-image-input-file').forEach((input) => expect(input).toBeDisabled());
        testIds.forEach((testId) => expect(screen.getByTestId(testId)).toBeDisabled());
    });
};

export const itShowsValidationErrorOnBlur = (renderComponent: RenderSection, testId: string, changeTo?: string) => {
    it(`shows a validation error on blur of ${testId}`, () => {
        getValidateTextMock().mockReturnValueOnce('Too short');
        renderComponent();

        if (changeTo !== undefined) {
            fireEvent.change(screen.getByTestId(testId), { target: { value: changeTo } });
        }
        fireEvent.blur(screen.getByTestId(testId));

        expect(screen.getByText('Too short')).toBeInTheDocument();
    });
};

export const itSupportsTranslateButton = (renderComponent: RenderSection) => {
    const getButton = () => screen.queryByRole('button', { name: TRANSLATE_BUTTON_NAME });

    it('does not render the translation icon without onTranslateClick', () => {
        renderComponent();

        expect(getButton()).not.toBeInTheDocument();
    });

    it('renders the translation icon and calls onTranslateClick when it is clicked', () => {
        const onTranslateClick = jest.fn();
        renderComponent({ onTranslateClick });

        fireEvent.click(getButton()!);

        expect(onTranslateClick).toHaveBeenCalledTimes(1);
    });

    it('disables the translation icon when isTranslateDisabled is true', () => {
        renderComponent({ onTranslateClick: jest.fn(), isTranslateDisabled: true });

        expect(getButton()).toBeDisabled();
    });
};
