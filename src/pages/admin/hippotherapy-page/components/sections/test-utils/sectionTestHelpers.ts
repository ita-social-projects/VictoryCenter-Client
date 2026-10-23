import { screen, fireEvent } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export const runsSectionImageInputTests = <TValue extends object>(
    renderComponent: (props?: Record<string, unknown>) => void,
    defaultValue: TValue,
    getMockOnChange: () => jest.Mock,
) => {
    it('calls onChange with the updated image', () => {
        renderComponent();

        const file = new File(['dummy'], 'test.png', { type: 'image/png' });
        fireEvent.change(screen.getByTestId('mock-image-input-file'), { target: { files: [file] } });

        expect(getMockOnChange()).toHaveBeenCalledWith({ ...defaultValue, image: file });
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

export interface SectionFieldUpdateConfig<TValue> {
    testId: string;
    fieldName: keyof TValue & string;
    label: string;
    newValue: string;
}

export const runsSectionFieldUpdateTests = <TValue extends object>(
    renderComponent: (props?: Record<string, unknown>) => void,
    defaultValue: TValue,
    getMockOnChange: () => jest.Mock,
    fields: SectionFieldUpdateConfig<TValue>[],
) => {
    fields.forEach(({ testId, fieldName, label, newValue }) => {
        it(`calls onChange with the updated ${label}`, () => {
            renderComponent();

            fireEvent.change(screen.getByTestId(testId), { target: { value: newValue } });

            expect(getMockOnChange()).toHaveBeenCalledWith({ ...defaultValue, [fieldName]: newValue });
        });
    });
};

export const runsSectionFieldValidationErrorTest = (
    renderComponent: (props?: Record<string, unknown>) => void,
    getValidateTextMock: () => jest.Mock,
    testId: string,
    testName: string,
    options: { errorMessage?: string; newValue?: string } = {},
) => {
    const { errorMessage = 'Too short', newValue } = options;

    it(testName, () => {
        getValidateTextMock().mockReturnValueOnce(errorMessage);
        renderComponent();

        if (newValue !== undefined) {
            fireEvent.change(screen.getByTestId(testId), { target: { value: newValue } });
        }
        fireEvent.blur(screen.getByTestId(testId));

        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
};

export const runsSectionDisablesInputsTest = (
    renderComponent: (props?: Record<string, unknown>) => void,
    testIds: string[],
    testName = 'disables all inputs when disabled is true',
) => {
    it(testName, () => {
        renderComponent({ disabled: true });

        testIds.forEach((testId) => expect(screen.getByTestId(testId)).toBeDisabled());
    });
};

export const runsSectionTranslationHeaderTests = (
    renderComponent: (props?: Record<string, unknown>) => void,
    buildEnabledProps: (onTranslateClick: jest.Mock) => Record<string, unknown>,
    buildDisabledProps: (onTranslateClick: jest.Mock) => Record<string, unknown>,
) => {
    it('does not render the translation icon without a translate handler', () => {
        renderComponent();

        expect(
            screen.queryByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION }),
        ).not.toBeInTheDocument();
    });

    it('renders the translation icon and calls the translate handler when it is clicked', () => {
        const onTranslateClick = jest.fn();
        renderComponent(buildEnabledProps(onTranslateClick));

        fireEvent.click(
            screen.getByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION }),
        );

        expect(onTranslateClick).toHaveBeenCalledTimes(1);
    });

    it('disables the translation icon when the disabled flag is true', () => {
        renderComponent(buildDisabledProps(jest.fn()));

        expect(
            screen.getByRole('button', { name: COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION }),
        ).toBeDisabled();
    });
};
