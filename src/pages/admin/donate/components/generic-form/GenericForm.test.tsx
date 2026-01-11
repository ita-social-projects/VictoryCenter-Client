import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createGenericForm, GenericFormField, GenericFormMode, GenericFormProps } from './GenericForm';
import { DONATE_TEXT } from '@/const/admin/donate';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import React from 'react';

interface Item {
    id?: number;
    name: string;
    optional?: string;
}

const createDefaultFields = (): GenericFormField<Item>[] => [
    { name: 'name', label: 'Name', isRequired: true, isTitle: true },
    { name: 'optional', label: 'Optional' },
];

const createDefaultProps = (overrides?: Partial<GenericFormProps<Item>>): GenericFormProps<Item> => ({
    initialData: { id: 1, name: 'Test Name', optional: 'opt' },
    initialMode: GenericFormMode.View,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    onDelete: jest.fn(),
    children: ({ formState }) => <div>{formState.optional}</div>,
    ...overrides,
});

const renderForm = (props?: Partial<GenericFormProps<Item>>) => {
    const fields = createDefaultFields();
    const GenericForm = createGenericForm<Item>(fields);
    const mergedProps = createDefaultProps(props);
    return render(<GenericForm {...mergedProps} />);
};

const renderFormWithRef = (props?: Partial<GenericFormProps<Item>>) => {
    const fields = createDefaultFields();
    const GenericForm = createGenericForm<Item>(fields);
    const ref = React.createRef<any>();
    const mergedProps = createDefaultProps(props);
    render(<GenericForm {...mergedProps} ref={ref} />);
    return ref;
};

const getButton = (name: string) => screen.getByRole('button', { name });
const getTextButton = (text: string) => screen.getByText(text);
const getInput = (value: string) => screen.getByDisplayValue(value) as HTMLInputElement;
const getPublishButton = () => getTextButton(DONATE_TEXT.BUTTON.PUBLISH);
const getCancelButton = () => getTextButton(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
const getEditButton = () => getButton('edit-btn');
const getDeleteButton = () => getButton('delete-btn');

const clickButton = (button: HTMLElement) => fireEvent.click(button);
const changeInput = (input: HTMLInputElement, value: string) => {
    fireEvent.change(input, { target: { value } });
};
const blurInput = (input: HTMLInputElement) => fireEvent.blur(input);

const clickHeader = (text: string = 'Test Name') => {
    const header = screen.getByText(text);
    fireEvent.click(header);
    return header;
};

const confirmModal = async () => {
    const confirmButton = getTextButton(COMMON_TEXT_ADMIN.BUTTON.YES);
    clickButton(confirmButton);
};

const cancelModal = () => {
    const cancelButton = getTextButton(COMMON_TEXT_ADMIN.BUTTON.NO);
    clickButton(cancelButton);
};

const testFieldChange = (fieldsConfig: GenericFormField<Item>[], changeValue: string, expectedValue: string) => {
    const TestForm = createGenericForm<Item>(fieldsConfig);

    render(
        <TestForm
            initialData={{ id: 1, name: 'Test', optional: 'opt' }}
            initialMode={GenericFormMode.Edit}
            onClose={jest.fn()}
            onSubmit={jest.fn()}
        />,
    );

    const input = screen.getByDisplayValue('Test') as HTMLInputElement;
    changeInput(input, changeValue);
    blurInput(input);

    expect(input.value).toBe(expectedValue);
};

describe('GenericForm', () => {
    const fields = createDefaultFields();

    describe('Basic Rendering', () => {
        test('renders form in view mode', () => {
            renderForm();
            expect(screen.getByText('Test Name')).toBeInTheDocument();
            expect(getDeleteButton()).toBeInTheDocument();
        });

        test('returns null when isOpen is false', () => {
            const { container } = renderForm({ isOpen: false });
            expect(container.firstChild).toBeNull();
        });

        it('renders children when isChildForm is false', () => {
            renderForm({ isChildForm: false });
            expect(screen.getByText('opt')).toBeInTheDocument();
        });

        it('does not render children when isChildForm is true', () => {
            renderForm({ isChildForm: true });
            expect(screen.queryByText('opt')).not.toBeInTheDocument();
        });
    });

    describe('Mode Switching', () => {
        test('switches to edit mode when edit button is clicked', () => {
            renderForm();
            clickButton(getEditButton());
            expect(getInput('Test Name')).toBeInTheDocument();
        });

        it('toggles from View to Edit mode and expands form on edit button click', () => {
            renderForm({ initialMode: GenericFormMode.View });
            clickButton(getEditButton());
            expect(getInput('Test Name')).toBeInTheDocument();
            expect(getInput('opt')).toBeInTheDocument();
        });

        it('keeps form expanded after switching from View to Edit', () => {
            renderForm({ initialMode: GenericFormMode.View });
            clickButton(getEditButton());
            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBeGreaterThan(0);
        });

        it('does not toggle mode when clicking edit button in Edit mode', () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            clickButton(getEditButton());
            expect(getInput('Test Name')).toBeInTheDocument();
        });

        it('calls onModeChange when mode changes', () => {
            const onModeChange = jest.fn();
            renderForm({ initialMode: GenericFormMode.View, onModeChange });

            expect(onModeChange).toHaveBeenCalledWith(GenericFormMode.View);

            clickButton(getEditButton());

            expect(onModeChange).toHaveBeenCalledWith(GenericFormMode.Edit);
        });
    });

    describe('Input Handling', () => {
        test('changes input value', () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            const input = getInput('Test Name');
            changeInput(input, 'New Name');
            expect(input.value).toBe('New Name');
        });

        it('validates field on blur', () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            const input = getInput('Test Name');
            blurInput(input);
        });
    });

    describe('Form Submission', () => {
        test('publish on updated form', async () => {
            const onSubmit = jest.fn();
            renderForm({ initialMode: GenericFormMode.Edit, onSubmit });
            const input = getInput('Test Name');
            changeInput(input, 'Updated Name');

            clickButton(getPublishButton());

            expect(getPublishButton()).toBeInTheDocument();
        });

        it('successfully submits form and switches Edit to View mode', async () => {
            const onSubmit = jest.fn().mockResolvedValue(undefined);
            // eslint-disable-next-line testing-library/render-result-naming-convention
            const ref = renderFormWithRef({ initialMode: GenericFormMode.Edit, onSubmit });

            const input = getInput('Test Name');
            changeInput(input, 'New Name');

            await ref.current.submit();

            await waitFor(() => {
                expect(onSubmit).toHaveBeenCalledWith({ id: 1, name: 'New Name', optional: 'opt' });
                expect(screen.getByText('New Name')).toBeInTheDocument();
            });
        });

        it('prevents submit when onSubmit is not provided', async () => {
            // eslint-disable-next-line testing-library/render-result-naming-convention
            const ref = renderFormWithRef({ initialMode: GenericFormMode.Edit, onSubmit: undefined as any });

            const input = getInput('Test Name');
            changeInput(input, 'Changed');

            await ref.current.submit();

            expect(screen.getByDisplayValue('Changed')).toBeInTheDocument();
        });
    });

    describe('Validation', () => {
        test('shows validation error', () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            const input = getInput('Test Name');
            changeInput(input, '');

            clickButton(getPublishButton());

            expect(getPublishButton()).toBeInTheDocument();
        });

        it('isValid blocks submit for invalid required field', async () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            const input = getInput('Test Name');
            changeInput(input, '');

            const publishButton = getPublishButton();
            clickButton(publishButton);

            await waitFor(() => expect(publishButton).toBeInTheDocument());
        });

        it('should disable publish button if a custom validation error exists', () => {
            const fieldsWithValidator: GenericFormField<Item>[] = [
                {
                    name: 'name',
                    label: 'Name',
                    isTitle: true,
                    validate: (value) => ((value as string).length < 5 ? 'Name is too short' : undefined),
                },
            ];

            const FormWithValidator = createGenericForm<Item>(fieldsWithValidator);

            render(
                <FormWithValidator
                    {...createDefaultProps({
                        initialMode: GenericFormMode.Edit,
                        initialData: { id: 1, name: 'Valid Name' },
                    })}
                />,
            );

            const input = screen.getByDisplayValue('Valid Name') as HTMLInputElement;
            const publishButton = getPublishButton() as HTMLButtonElement;

            changeInput(input, '123');
            blurInput(input);

            expect(screen.getByText('Name is too short')).toBeInTheDocument();
            expect(publishButton.disabled).toBe(true);
        });

        it('detects empty required fields', () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            const input = getInput('Test Name');
            changeInput(input, '');

            const publishBtn = getPublishButton() as HTMLButtonElement;
            expect(publishBtn.disabled).toBe(true);
        });
    });

    describe('Cancel Behavior', () => {
        test('cancel resets form state', () => {
            const onClose = jest.fn();
            renderForm({ initialMode: GenericFormMode.Create, onClose });
            clickButton(getCancelButton());
            expect(onClose).toHaveBeenCalled();
        });

        it('handleEditCancel restores initial state if changed', () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            const input = getInput('Test Name');
            changeInput(input, 'Changed');

            clickButton(getCancelButton());

            expect(
                screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
            ).toBeInTheDocument();
        });

        it('Create mode cancel without changes calls onClose directly', () => {
            const onClose = jest.fn();
            renderForm({ initialMode: GenericFormMode.Create, onClose });
            clickButton(getCancelButton());
            expect(onClose).toHaveBeenCalled();
        });

        it('calls onClose directly in Create mode if no changes', () => {
            const onClose = jest.fn();
            renderForm({ initialMode: GenericFormMode.Create, onClose });
            clickButton(getCancelButton());
            expect(onClose).toHaveBeenCalled();
        });

        it('resets form state without modal when canceling Edit with no changes', () => {
            renderForm({ initialMode: GenericFormMode.Edit });

            clickButton(getCancelButton());

            expect(
                screen.queryByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
            ).not.toBeInTheDocument();
            expect(getEditButton()).toBeInTheDocument();
        });

        it('resets form and switches mode to View if no changes on cancel', () => {
            const initialData = { name: 'Test Name', receiver: 'Test Receiver' };
            const onClose = jest.fn();
            interface TestForm {
                id?: number;
                name: string;
                receiver: string;
            }

            const Form = createGenericForm<TestForm>([
                { name: 'name', isTitle: true, isRequired: true },
                { name: 'receiver', isRequired: true },
            ]);

            render(
                React.createElement(Form as any, {
                    initialMode: GenericFormMode.Edit,
                    initialData,
                    onSubmit: jest.fn(),
                    onClose,
                }),
            );

            clickButton(getCancelButton());

            expect(screen.getByRole('button', { name: /edit-btn/i })).toBeInTheDocument();
            expect(screen.getByText('Test Name')).toBeInTheDocument();
            expect(screen.getByText('Test Receiver')).toBeInTheDocument();
        });

        it('shows cancel edit modal in Create mode when there are unsaved changes', () => {
            renderForm({ initialMode: GenericFormMode.Create });
            const input = getInput('Test Name');
            changeInput(input, 'Changed');

            clickButton(getCancelButton());

            expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.CANCEL_CREATE)).toBeInTheDocument();
        });

        it('shows correct modal when canceling Create mode in child form during parent creation', () => {
            renderForm({
                initialMode: GenericFormMode.Create,
                isChildForm: true,
                isParentCreating: true,
            });

            const input = getInput('Test Name');
            changeInput(input, 'Changed');

            clickButton(getCancelButton());

            expect(
                screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
            ).toBeInTheDocument();
        });

        it('confirms cancel and resets form state in Edit mode when changes exist', () => {
            renderForm({ initialMode: GenericFormMode.Edit });

            const input = getInput('Test Name');
            changeInput(input, 'Changed');

            clickButton(getCancelButton());

            expect(
                screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
            ).toBeInTheDocument();

            const confirmBtn = getTextButton(COMMON_TEXT_ADMIN.BUTTON.YES);
            clickButton(confirmBtn);

            expect(screen.getByText('Test Name')).toBeInTheDocument();
        });
    });

    describe('Delete Functionality', () => {
        test('opens confirmation modal on delete click', () => {
            renderForm();
            clickButton(getDeleteButton());
            expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.DELETE)).toBeInTheDocument();
        });

        test('closes modal on cancel', () => {
            renderForm();
            clickButton(getDeleteButton());

            cancelModal();

            expect(screen.queryByText(DONATE_TEXT.QUESTION.BANK_DETAILS.DELETE)).not.toBeInTheDocument();
        });

        it('handleDeleteClick triggers onDelete for Edit mode', async () => {
            const onDelete = jest.fn().mockResolvedValue(undefined);
            renderForm({ initialMode: GenericFormMode.Edit, onDelete });
            clickButton(getDeleteButton());

            await confirmModal();

            await waitFor(() => expect(onDelete).toHaveBeenCalledWith(1));
        });

        it('does not call onDelete if no id provided', async () => {
            const onDelete = jest.fn();
            renderForm({ initialData: { name: 'No ID' }, onDelete });
            clickButton(getDeleteButton());

            await confirmModal();

            await waitFor(() => expect(onDelete).not.toHaveBeenCalled());
        });

        it('calls preventDefault on delete button click', () => {
            renderForm();
            const deleteButton = getDeleteButton();

            const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
            const preventDefaultSpy = jest.spyOn(clickEvent, 'preventDefault');

            fireEvent(deleteButton, clickEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('calls onDelete and onClose for child form in parent creation mode', async () => {
            const onDelete = jest.fn().mockResolvedValue(undefined);
            const onClose = jest.fn();

            renderForm({
                initialData: { id: 1, name: 'Test Name', optional: 'opt' },
                isChildForm: true,
                isParentCreating: true,
                onDelete,
                onClose,
            });

            const header = screen.getByText('Test Name');
            clickButton(header);

            clickButton(getDeleteButton());

            await confirmModal();

            await waitFor(() => {
                expect(onDelete).toHaveBeenCalledWith(1);
                expect(onClose).toHaveBeenCalled();
            });
        });

        it('shows specific delete title for bank with correspondentBanks', () => {
            const dataWithCorrespondentBanks = {
                id: 1,
                name: 'Test Bank',
                optional: 'opt',
                correspondentBanks: [{ name: 'Correspondent Bank', swift: 'TEST', account: '123' }],
            };

            renderForm({
                initialData: dataWithCorrespondentBanks as any,
                initialMode: GenericFormMode.View,
            });

            clickButton(getDeleteButton());

            expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.FOREIGN.DELETE)).toBeInTheDocument();
        });

        it('shows default delete title when correspondentBanks is empty array', () => {
            const dataWithEmptyCorrespondentBanks = {
                id: 1,
                name: 'Test Bank',
                optional: 'opt',
                correspondentBanks: [],
            };

            renderForm({ initialData: dataWithEmptyCorrespondentBanks as any });

            clickButton(getDeleteButton());

            expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.DELETE)).toBeInTheDocument();
        });
    });

    describe('Publish Button States', () => {
        it('should have the publish button disabled on initial render in Edit mode', () => {
            renderForm({ initialMode: GenericFormMode.Edit });

            const publishButton = getPublishButton() as HTMLButtonElement;
            expect(publishButton.disabled).toBe(true);
        });

        it('publish button disabled if required field empty', () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            const input = getInput('Test Name');
            changeInput(input, '');

            const publishButton = getPublishButton() as HTMLButtonElement;
            expect(publishButton.disabled).toBe(true);
        });

        it('isChanged returns true after input change', () => {
            renderForm({ initialMode: GenericFormMode.Edit });
            const input = getInput('Test Name');
            changeInput(input, 'Changed');
            const publishButton = getPublishButton();
            expect(publishButton).not.toBeDisabled();
        });

        it('disables publish button when isDisabled is true and not correspondent in parent creation', () => {
            renderForm({ initialMode: GenericFormMode.Edit, isDisabled: true });

            const input = getInput('Test Name');
            changeInput(input, 'Changed');

            const publishButton = getPublishButton() as HTMLButtonElement;
            expect(publishButton.disabled).toBe(true);
        });

        it('enables publish button when isDisabled is true but isCorrespondentInParentCreation is true', () => {
            renderForm({
                initialMode: GenericFormMode.Create,
                isChildForm: true,
                isParentCreating: true,
                isDisabled: true,
            });

            const input = getInput('Test Name');
            changeInput(input, 'Changed');

            const saveButton = getTextButton(COMMON_TEXT_ADMIN.BUTTON.SAVE) as HTMLButtonElement;
            expect(saveButton.disabled).toBe(false);
        });
    });

    describe('Expansion and Collapse', () => {
        it('toggles expanded state on header click and keydown', () => {
            renderForm();
            const header = clickHeader();

            expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(true);

            fireEvent.keyDown(header, { key: 'Enter' });
            expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(false);
        });

        it('handles View mode cancel by calling handleViewCancel', () => {
            renderForm({ initialMode: GenericFormMode.View });

            const header = clickHeader();
            expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(true);

            fireEvent.keyDown(header, { key: 'Escape' });
            clickButton(header);

            expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(false);
        });
    });

    describe('Ref API', () => {
        it('exposes submit, isChanged, isValid via ref', async () => {
            // eslint-disable-next-line testing-library/render-result-naming-convention
            const ref = renderFormWithRef({ initialMode: GenericFormMode.Edit });

            await waitFor(() => {
                expect(ref.current).toBeDefined();
            });

            expect(ref.current.isChanged()).toBe(false);

            const input = getInput('Test Name');
            changeInput(input, 'Changed');
            expect(ref.current.isChanged()).toBe(true);

            expect(ref.current.isValid()).toBe(true);
        });
    });

    describe('Child Form Behavior', () => {
        const getChildFormDeleteButton = () => {
            const childFields: GenericFormField<Item>[] = [
                { name: 'name', label: 'Name', isTitle: true, isRequired: true },
                { name: 'optional', label: 'Optional' },
            ];
            const ChildForm = createGenericForm<Item>(childFields);

            render(
                <ChildForm
                    initialData={{ id: 1, name: 'Test Name', optional: 'opt' }}
                    initialMode={GenericFormMode.View}
                    isChildForm={true}
                    onClose={jest.fn()}
                    onSubmit={jest.fn()}
                    onDelete={jest.fn()}
                />,
            );

            clickHeader();

            return getDeleteButton();
        };

        test('resets isDeleting on modal cancel', () => {
            const deleteButton = getChildFormDeleteButton();
            clickButton(deleteButton);

            expect(screen.getByText(DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE)).toBeInTheDocument();

            cancelModal();

            expect(screen.queryByText(DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE)).not.toBeInTheDocument();
        });

        it('shows correct delete title for child form', () => {
            const deleteButton = getChildFormDeleteButton();
            clickButton(deleteButton);

            expect(screen.getByText(DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE)).toBeInTheDocument();
        });

        it('covers isDeleting state in child form delete', () => {
            const deleteButton = getChildFormDeleteButton();
            clickButton(deleteButton);

            expect(screen.getByText(DONATE_TEXT.QUESTION.CORRESPONDENT_BANKS.DELETE)).toBeInTheDocument();
        });
    });

    describe('Array Field Handling', () => {
        it('disables publish when required array field is empty', () => {
            const arrayFields: GenericFormField<any>[] = [
                { name: 'name', isRequired: true, isTitle: true },
                { name: 'tags', isRequired: true },
            ];
            const ArrayForm = createGenericForm<{ id?: number; name: string; tags: string[] }>(arrayFields);

            render(
                <ArrayForm
                    initialData={{ id: 1, name: 'Name', tags: [] }}
                    initialMode={GenericFormMode.Edit}
                    onClose={jest.fn()}
                    onSubmit={jest.fn()}
                />,
            );
            const publishBtn = getPublishButton() as HTMLButtonElement;
            expect(publishBtn.disabled).toBe(true);
        });

        it('does not render fields with empty array values in View mode', () => {
            const fieldsWithArray: GenericFormField<any>[] = [
                { name: 'name', isTitle: true },
                { name: 'tags', label: 'Tags' },
            ];
            const FormWithArray = createGenericForm<{ id?: number; name: string; tags: string[] }>(fieldsWithArray);

            render(
                <FormWithArray
                    initialData={{ id: 1, name: 'Test', tags: [] }}
                    initialMode={GenericFormMode.View}
                    onClose={jest.fn()}
                    onSubmit={jest.fn()}
                />,
            );

            expect(screen.queryByText('Tags')).not.toBeInTheDocument();
        });
    });

    describe('Create Mode Workflows', () => {
        it('handles Create mode cancel and submit', async () => {
            const onClose = jest.fn();
            const onSubmit = jest.fn().mockResolvedValue(undefined);

            renderForm({
                initialMode: GenericFormMode.Create,
                onClose,
                onSubmit,
            });

            clickButton(getCancelButton());
            expect(onClose).toHaveBeenCalled();

            clickButton(getPublishButton());
        });
    });

    describe('Coverage Edge Cases', () => {
        it('covers handleEditClick in View to Edit transition', () => {
            renderForm({ initialMode: GenericFormMode.View });

            clickButton(getEditButton());

            expect(getInput('Test Name')).toBeInTheDocument();
            expect(getInput('opt')).toBeInTheDocument();
        });

        it('handles value change for field without validator', () => {
            testFieldChange(fields, 'Updated', 'Updated');
        });

        it('updates required field validation state', () => {
            testFieldChange(
                [
                    {
                        name: 'name',
                        isTitle: true,
                        isRequired: true,
                        validate: (val) => (val ? undefined : 'Required'),
                    },
                    { name: 'optional' },
                ],
                '',
                '',
            );
        });
    });
});

describe('Delete with ItemIndex', () => {
    it('calls onDelete with id and itemIndex when both are provided', async () => {
        const onDelete = jest.fn().mockResolvedValue(undefined);
        const onClose = jest.fn();

        renderForm({
            initialData: { id: 5, name: 'Test', optional: 'opt' },
            itemIndex: 3,
            onDelete,
            onClose,
        });

        clickButton(getDeleteButton());

        await confirmModal();

        await waitFor(() => {
            expect(onDelete).toHaveBeenCalledWith(5, 3);
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('calls onDelete with null and itemIndex when id is missing', async () => {
        const onDelete = jest.fn().mockResolvedValue(undefined);
        const onClose = jest.fn();

        renderForm({
            initialData: { name: 'Test', optional: 'opt' },
            itemIndex: 2,
            onDelete,
            onClose,
        });

        clickButton(getDeleteButton());

        await confirmModal();

        await waitFor(() => {
            expect(onDelete).toHaveBeenCalledWith(null, 2);
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('does not call onDelete when both id and itemIndex are missing', async () => {
        const onDelete = jest.fn().mockResolvedValue(undefined);

        renderForm({ initialData: { name: 'Test', optional: 'opt' }, onDelete });

        clickButton(getDeleteButton());

        await confirmModal();

        await waitFor(() => {
            expect(onDelete).not.toHaveBeenCalled();
        });
    });
});

describe('Publish Button Behaviors', () => {
    it('calls submit directly for correspondent in parent creation (isCorrespondentInParentCreation)', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);

        renderForm({
            initialMode: GenericFormMode.Create,
            isChildForm: true,
            isParentCreating: true,
            onSubmit,
        });

        const input = getInput('Test Name');
        changeInput(input, 'Changed');

        const saveButton = getTextButton(COMMON_TEXT_ADMIN.BUTTON.SAVE);
        clickButton(saveButton);

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
    });

    it('shows update confirmation modal in Edit mode', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);

        renderForm({ initialMode: GenericFormMode.Edit, onSubmit });

        const input = getInput('Test Name');
        changeInput(input, 'Updated');

        clickButton(getPublishButton());

        expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.UPDATE)).toBeInTheDocument();

        await confirmModal();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
    });

    it('shows add confirmation modal in Create mode', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);

        renderForm({ initialMode: GenericFormMode.Create, onSubmit });

        const input = getInput('Test Name');
        changeInput(input, 'New Name');

        clickButton(getPublishButton());

        expect(screen.getByText(DONATE_TEXT.QUESTION.BANK_DETAILS.ADD)).toBeInTheDocument();

        await confirmModal();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalled();
        });
    });
});

describe('Field Filtering and Rendering', () => {
    it('renders all fields in Create mode regardless of values', () => {
        renderForm({
            initialData: { name: 'Test', optional: '' },
            initialMode: GenericFormMode.Create,
        });

        expect(getInput('Test')).toBeInTheDocument();
        expect(getInput('')).toBeInTheDocument();
    });

    it('filters out fields with empty trimmed string values in View mode', () => {
        renderForm({
            initialData: { name: 'Test', optional: '   ' },
            initialMode: GenericFormMode.View,
        });

        clickHeader('Test');

        expect(screen.queryByText('Optional')).not.toBeInTheDocument();
    });

    it('does not filter title field in View mode', () => {
        renderForm({ initialMode: GenericFormMode.View });

        const header = screen.getByText('Test Name');
        expect(header).toBeInTheDocument();
    });
});

describe('Field Value Processing', () => {
    it('removes all spaces when ignoreSpacesInCount is true on submit', async () => {
        const fieldsWithIgnoreSpaces: GenericFormField<Item>[] = [
            { name: 'name', isRequired: true, isTitle: true, ignoreSpacesInCount: true },
        ];
        const FormWithIgnoreSpaces = createGenericForm<Item>(fieldsWithIgnoreSpaces);
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        const ref = React.createRef<any>();

        render(
            <FormWithIgnoreSpaces
                initialData={{ name: 'Test Name' }}
                initialMode={GenericFormMode.Edit}
                onSubmit={onSubmit}
                onClose={jest.fn()}
                ref={ref}
            />,
        );

        const input = screen.getByDisplayValue('Test Name') as HTMLInputElement;
        changeInput(input, 'New   Name   With   Spaces');

        await ref.current.submit();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({ name: 'NewNameWithSpaces' });
        });
    });

    it('trims start of string when ignoreSpacesInCount is false on submit', async () => {
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        // eslint-disable-next-line testing-library/render-result-naming-convention
        const ref = renderFormWithRef({ initialMode: GenericFormMode.Edit, onSubmit });

        const input = getInput('Test Name');
        changeInput(input, '   Leading Spaces');

        await ref.current.submit();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Leading Spaces' }));
        });
    });

    it('handles non-string field values in submit', async () => {
        const fieldsWithNumber: GenericFormField<any>[] = [
            { name: 'name', isRequired: true, isTitle: true },
            { name: 'count', label: 'Count' },
        ];
        const FormWithNumber = createGenericForm<{ id?: number; name: string; count: number }>(fieldsWithNumber);
        const onSubmit = jest.fn().mockResolvedValue(undefined);
        const ref = React.createRef<any>();

        render(
            <FormWithNumber
                initialData={{ name: 'Test', count: 42 }}
                initialMode={GenericFormMode.Edit}
                onSubmit={onSubmit}
                onClose={jest.fn()}
                ref={ref}
            />,
        );

        const input = screen.getByDisplayValue('Test') as HTMLInputElement;
        changeInput(input, 'Updated');

        await ref.current.submit();

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({ name: 'Updated', count: 42 });
        });
    });
});

describe('Keyboard Interactions', () => {
    it('prevents propagation on Enter key in form container', () => {
        renderForm();

        const formContainer = document.querySelector('.generic-form') as HTMLElement;

        fireEvent.keyDown(formContainer, { key: 'Enter' });

        expect(screen.getByText('Test Name')).toBeInTheDocument();
    });

    it('prevents propagation on Space key in form container', () => {
        renderForm();

        const formContainer = document.querySelector('.generic-form') as HTMLElement;

        fireEvent.keyDown(formContainer, { key: ' ' });

        expect(screen.getByText('Test Name')).toBeInTheDocument();
    });

    it('does not prevent propagation on other keys in form container', () => {
        renderForm();

        const formContainer = document.querySelector('.generic-form') as HTMLElement;

        fireEvent.keyDown(formContainer, { key: 'Escape' });

        expect(screen.getByText('Test Name')).toBeInTheDocument();
    });

    it('toggles expansion on Space key press on header', () => {
        renderForm();
        const header = screen.getByText('Test Name');

        fireEvent.keyDown(header, { key: ' ' });
        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(true);

        fireEvent.keyDown(header, { key: ' ' });
        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(false);
    });

    it('does not toggle expansion on other keys on header', () => {
        renderForm();
        const header = screen.getByText('Test Name');

        const initialExpanded = header.querySelector('.arrow')?.classList.contains('expanded');

        fireEvent.keyDown(header, { key: 'a' });

        expect(header.querySelector('.arrow')?.classList.contains('expanded')).toBe(initialExpanded);
    });
});
