import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';

import { MAIN_PAGE_VALIDATION } from '@/const/admin/main-page';
import {
    TranslateMainPageBlockForm,
    TranslateMainPageBlockFormRef,
    TranslateMainPageBlockFormValues,
} from './TranslateMainPageBlockForm';

jest.mock('@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup', () => ({
    __esModule: true,
    RichTextInputGroup: require('@/utils/test-mocks/main-page-mocks').MockRichTextInputGroup,
}));

const titleInput = () => document.getElementById('main-page-translation-title') as HTMLInputElement;
const descriptionInput = () => document.getElementById('main-page-translation-description') as HTMLTextAreaElement;

const validationConfig = {
    titleField: 'titleUa' as const,
    descriptionField: 'descriptionUa' as const,
    titleMaxLength: MAIN_PAGE_VALIDATION.titleBlock.title.max,
    descriptionMaxLength: MAIN_PAGE_VALIDATION.titleBlock.description.max,
};

interface HarnessProps {
    initialData?: TranslateMainPageBlockFormValues | null;
    onSubmit?: jest.Mock;
    config?: typeof validationConfig;
}

const Harness = ({ initialData = null, onSubmit = jest.fn(), config = validationConfig }: HarnessProps) => {
    const formRef = useRef<TranslateMainPageBlockFormRef>(null);
    const [isValid, setIsValid] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    return (
        <>
            <TranslateMainPageBlockForm
                ref={formRef}
                initialData={initialData}
                validationConfig={config}
                onSubmit={onSubmit}
                onValidationChange={setIsValid}
                onDirtyChange={setIsDirty}
            />
            <button type="button" disabled={!isValid || !isDirty} onClick={() => formRef.current?.submit()}>
                Save
            </button>
        </>
    );
};

describe('TranslateMainPageBlockForm', () => {
    it('renders empty fields in add mode and keeps save disabled initially', () => {
        render(<Harness />);

        expect(titleInput()).toHaveValue('');
        expect(descriptionInput()).toHaveValue('');
        expect(titleInput()).toHaveAttribute('data-max-length', '50');
        expect(descriptionInput()).toHaveAttribute('data-max-length', '300');
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('renders prefilled fields in edit mode and keeps save disabled until changed', () => {
        render(<Harness initialData={{ title: 'Existing English title', description: 'Existing description' }} />);

        expect(titleInput()).toHaveValue('Existing English title');
        expect(descriptionInput()).toHaveValue('Existing description');
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('validates required fields while typing', async () => {
        render(<Harness />);

        fireEvent.change(titleInput(), { target: { value: 'Valid title' } });
        fireEvent.change(titleInput(), { target: { value: '' } });

        expect(await screen.findByText("Поле обов'язкове")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('validates text length by plain text content from rich text HTML', async () => {
        render(<Harness config={{ ...validationConfig, titleMaxLength: 50 }} />);

        fireEvent.change(titleInput(), { target: { value: `<p>${'x'.repeat(51)}</p>` } });
        fireEvent.blur(titleInput());

        expect(await screen.findByText('Не більше 50 символів')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });

    it('enables save after valid rich text changes and submits HTML values', async () => {
        const onSubmit = jest.fn();
        render(<Harness onSubmit={onSubmit} />);

        fireEvent.change(titleInput(), { target: { value: '<p><strong>Valid title text</strong></p>' } });
        fireEvent.change(descriptionInput(), { target: { value: '<p><em>Valid description text</em></p>' } });

        await waitFor(() => expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled());

        fireEvent.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({
                title: '<p><strong>Valid title text</strong></p>',
                description: '<p><em>Valid description text</em></p>',
            });
        });
    });
});
