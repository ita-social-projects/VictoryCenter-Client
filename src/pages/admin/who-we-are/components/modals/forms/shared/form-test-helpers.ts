import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { RefObject } from 'react';

interface SubmittableFormRef {
    submit: () => Promise<void> | void;
}

export const changeRichTextField = (id: string, value: string): void => {
    fireEvent.change(screen.getByTestId(`rich-text-${id}`), {
        target: { value },
    });
};

export const focusRichTextField = (id: string): void => {
    fireEvent.focus(screen.getByTestId(`rich-text-${id}`));
};

export const blurRichTextField = (id: string): void => {
    fireEvent.blur(screen.getByTestId(`rich-text-${id}`));
};

export const submitFormByRef = async (ref: RefObject<SubmittableFormRef | null>): Promise<void> => {
    await act(async () => {
        await ref.current?.submit();
    });
};

export const assertRichTextChangeMarksFormDirty = async (
    fieldId: string,
    value: string,
    onDirtyChange: jest.Mock,
): Promise<void> => {
    changeRichTextField(fieldId, value);

    await waitFor(() => {
        expect(onDirtyChange).toHaveBeenCalledWith(true);
    });
};

export const assertRichTextErrorOnBlur = async (
    fieldId: string,
    errorTestId: string,
    errorMessage: string,
    shouldFocusBeforeBlur = false,
): Promise<void> => {
    if (shouldFocusBeforeBlur) {
        focusRichTextField(fieldId);
    }

    blurRichTextField(fieldId);

    await waitFor(() => {
        expect(screen.getByTestId(errorTestId)).toHaveTextContent(errorMessage);
    });
};
