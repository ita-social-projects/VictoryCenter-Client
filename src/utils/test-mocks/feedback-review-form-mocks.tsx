import { screen } from '@testing-library/react';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';

export const MockInputWithCharacterLimitGroup = ({ value, onChange, error, name, id, label, onBlur }: any) => (
    <div>
        <label htmlFor={id}>{label}</label>
        <input name={name} id={id} value={value} onChange={onChange} onBlur={onBlur} />
        {error && <span data-testid="author-name-error">{error}</span>}
    </div>
);

export const MockTextAreaWithCharacterLimitGroup = ({ value, onChange, error, name, id, label, onBlur }: any) => (
    <div>
        <label htmlFor={id}>{label}</label>
        <textarea name={name} id={id} value={value} onChange={onChange} onBlur={onBlur} />
        {error && <span data-testid="text-error">{error}</span>}
    </div>
);

export const getAuthorNameInput = () =>
    screen.getByRole('textbox', { name: FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.AUTHOR_NAME });

export const getTextInput = () => screen.getByRole('textbox', { name: FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.TEXT });

export const getPublishButton = () => screen.getByRole('button', { name: FEEDBACK_TEXT.ADD_REVIEW_MODAL.PUBLISH });
