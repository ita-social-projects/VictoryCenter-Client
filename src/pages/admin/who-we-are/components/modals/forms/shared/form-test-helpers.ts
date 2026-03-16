import { act, fireEvent, screen } from '@testing-library/react';
import { RefObject } from 'react';

interface SubmittableFormRef {
    submit: () => Promise<void> | void;
}

export const changeRichTextField = (id: string, value: string): void => {
    fireEvent.change(screen.getByTestId(`rich-text-${id}`), {
        target: { value },
    });
};

export const submitFormByRef = async (ref: RefObject<SubmittableFormRef>): Promise<void> => {
    await act(async () => {
        await ref.current?.submit();
    });
};