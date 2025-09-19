import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramCategoryModal, ProgramCategoryModalProps } from './ProgramCategoryModal';
import { ProgramsCategoriesApi } from '../../../../../services/api/admin/programs/programs-api';
import { ProgramCategory } from '../../../../../types/admin/programs';
import { PROGRAM_CATEGORY_TEXT, PROGRAM_CATEGORY_VALIDATION } from '../../../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';

jest.mock('../../../../../services/api/admin/programs/programs-api');
const mockedProgramsCategoriesApi = ProgramsCategoriesApi as jest.Mocked<typeof ProgramsCategoriesApi>;

// Simplify Modal rendering and expose structure hooks
jest.mock('../../../../../components/common/modal/Modal', () => {
    const ModalMock = ({ isOpen, children }: any) => (isOpen ? <div data-testid="modal">{children}</div> : null);
    ModalMock.Title = ({ children }: { children: React.ReactNode }) => <h1 data-testid="modal-title">{children}</h1>;
    ModalMock.Content = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-content">{children}</div>
    );
    ModalMock.Actions = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="modal-actions">{children}</div>
    );
    return { Modal: ModalMock };
});

jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

// Simplify Button
jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, className, buttonStyle, type }: any) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={className}
            data-style={buttonStyle}
            type={type || 'button'}
        >
            {children}
        </button>
    ),
}));

// Simplify InputLabel to avoid DOM label coupling in tests
jest.mock('../../../../../components/admin/input-label/InputLabel', () => ({
    InputLabel: ({ htmlFor, text, isRequired }: { htmlFor: string; text: string; isRequired?: boolean }) => (
        <div data-testid="input-label" data-for={htmlFor}>
            {text}
            {isRequired ? '*' : ''}
        </div>
    ),
}));

// Simplify HintBox
jest.mock('../../../../../components/admin/hint-box/HintBox', () => ({
    HintBox: ({ title, text }: { title: string; text?: string }) => (
        <div data-testid="hint-box">
            <p>{title}</p>
            {text && <p>{text}</p>}
        </div>
    ),
}));

// Render ConfirmationModal inline and clickable
jest.mock('../../../../../components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="confirm-modal">
                <div data-testid="confirm-title">{title}</div>
                <button onClick={onConfirm}>Yes</button>
                <button onClick={onCancel}>No</button>
            </div>
        ) : null,
}));

// Utilities
const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Alpha', programsCount: 0 },
    { id: 2, name: 'Beta', programsCount: 1 },
    { id: 3, name: 'Gamma', programsCount: 0 },
];

const mockedUseAdminClient = useAdminClient as jest.Mock;

beforeEach(() => {
    mockedUseAdminClient.mockReturnValue({
        client: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        },
    });
});

const renderModal = (overrideProps?: Partial<ProgramCategoryModalProps>) => {
    const baseAddProps: ProgramCategoryModalProps = {
        isOpen: true,
        onClose: jest.fn(),
        categories: mockCategories,
        mode: 'add',
        onAddCategory: jest.fn(),
    } as any;

    const props = { ...baseAddProps, ...overrideProps } as ProgramCategoryModalProps;
    const utils = render(<ProgramCategoryModal {...props} />);
    return { ...utils, props };
};

const getSaveButton = () => screen.getByText(COMMON_TEXT_ADMIN.BUTTON.SAVE);
const getNameInput = () => screen.getByRole('textbox');
const typeName = (value: string) => {
    const input = getNameInput();
    fireEvent.change(input, { target: { value } });
    return input;
};

describe('ProgramCategoryModal - Add Mode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders with Add title and disabled Save when empty', () => {
        renderModal();
        expect(screen.getByTestId('modal-title')).toHaveTextContent(PROGRAM_CATEGORY_TEXT.FORM.TITLE.ADD_CATEGORY);
        expect(getSaveButton()).toBeDisabled();
    });

    it('enables Save with valid non-duplicate name and submits successfully', async () => {
        mockedProgramsCategoriesApi.addProgramCategory.mockResolvedValue({
            id: 10,
            name: 'Delta',
            programsCount: 0,
        } as any);

        const { props } = renderModal();

        typeName('Delta');
        expect(getSaveButton()).not.toBeDisabled();

        fireEvent.click(getSaveButton());

        await waitFor(() => {
            expect(mockedProgramsCategoriesApi.addProgramCategory).toHaveBeenCalledWith(
                { id: null, name: 'Delta' },
                expect.objectContaining({ client: expect.any(Object) }),
            );
        });
        expect((props as any).onAddCategory).toHaveBeenCalled();
        expect((props as any).onClose).toHaveBeenCalled();
    });

    it('shows API error message on add failure and stays open', async () => {
        mockedProgramsCategoriesApi.addProgramCategory.mockRejectedValue(new Error('API Error'));

        const { props } = renderModal();

        typeName('Delta');
        fireEvent.click(getSaveButton());

        expect(await screen.findByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY)).toBeInTheDocument();
        expect((props as any).onAddCategory).not.toHaveBeenCalled();
        expect((props as any).onClose).not.toHaveBeenCalled();
    });

    it('disables Save and shows duplicate hint when name already exists', () => {
        renderModal();

        typeName('Alpha');
        expect(getSaveButton()).toBeDisabled();
        expect(
            screen.getByText(PROGRAM_CATEGORY_VALIDATION.name.getCategoryWithThisNameAlreadyExistsError()),
        ).toBeInTheDocument();
    });

    it('prevents submit when validation errors exist (e.g., too short)', () => {
        renderModal();

        typeName('Abc');
        fireEvent.click(getSaveButton());

        // Save does not proceed due to validation, API should not be called
        expect(mockedProgramsCategoriesApi.addProgramCategory).not.toHaveBeenCalled();
    });

    it('clears error message when modal re-opens', async () => {
        mockedProgramsCategoriesApi.addProgramCategory.mockRejectedValue(new Error('API Error'));
        const baseProps: ProgramCategoryModalProps = {
            isOpen: true,
            onClose: jest.fn(),
            categories: mockCategories,
            mode: 'add',
            onAddCategory: jest.fn(),
        } as any;
        const { rerender } = render(<ProgramCategoryModal {...baseProps} />);

        typeName('Delta');
        fireEvent.click(getSaveButton());
        await screen.findByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY);

        rerender(<ProgramCategoryModal {...baseProps} isOpen={false} />);
        rerender(<ProgramCategoryModal {...baseProps} isOpen={true} />);

        expect(screen.queryByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_CREATE_CATEGORY)).not.toBeInTheDocument();
    });
});

describe('ProgramCategoryModal - Edit Mode', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderEdit = (overrideProps?: Partial<ProgramCategoryModalProps>) => {
        return renderModal({ mode: 'edit', onEditCategory: jest.fn(), ...overrideProps } as any);
    };

    const getSelectButton = () => screen.getByRole('button', { expanded: false });
    const openSelect = () => fireEvent.click(getSelectButton());
    const getOptionByName = (name: string) => screen.getByRole('option', { name });

    it('renders with Edit title and pre-fills first category name; Save disabled until changed', () => {
        renderEdit();
        expect(screen.getByTestId('modal-title')).toHaveTextContent(PROGRAM_CATEGORY_TEXT.FORM.TITLE.EDIT_CATEGORY);
        // Name should match first category, so Save is disabled because nameNotChanged
        expect((getNameInput() as HTMLInputElement).value).toBe(mockCategories[0].name);
        expect(getSaveButton()).toBeDisabled();
    });

    it('updates name when selecting a different category from SingleSelectInput', () => {
        renderEdit();

        openSelect();
        fireEvent.click(getOptionByName('Gamma'));

        expect((getNameInput() as HTMLInputElement).value).toBe('Gamma');
    });

    it('opens confirm modal on Save, confirms and submits edit successfully', async () => {
        mockedProgramsCategoriesApi.editProgramCategory.mockResolvedValue({
            id: 1,
            name: 'Omega',
            programsCount: 0,
        } as any);

        const { props } = renderEdit();

        // Change name to enable Save
        typeName('Omega');
        expect(getSaveButton()).not.toBeDisabled();

        fireEvent.click(getSaveButton());
        expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
        expect(screen.getByTestId('confirm-title')).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.SAVE_CHANGES);

        fireEvent.click(screen.getByText('Yes'));

        await waitFor(() => {
            expect(mockedProgramsCategoriesApi.editProgramCategory).toHaveBeenCalledWith(
                { id: 1, name: 'Omega' },
                expect.objectContaining({ client: expect.any(Object) }),
            );
        });
        expect((props as any).onEditCategory).toHaveBeenCalled();
        expect((props as any).onClose).toHaveBeenCalled();
    });

    it('shows API error on edit failure and stays open', async () => {
        mockedProgramsCategoriesApi.editProgramCategory.mockRejectedValue(new Error('API Error'));

        const { props } = renderEdit();

        typeName('Omega');
        fireEvent.click(getSaveButton());
        fireEvent.click(screen.getByText('Yes'));

        expect(await screen.findByText(PROGRAM_CATEGORY_TEXT.FORM.MESSAGE.FAIL_TO_UPDATE_CATEGORY)).toBeInTheDocument();
        expect((props as any).onEditCategory).not.toHaveBeenCalled();
        expect((props as any).onClose).not.toHaveBeenCalled();
    });

    it('disables controls while submitting after confirming save', async () => {
        let resolveRequest!: () => void;
        const longRunningPromise = new Promise<any>((resolve) => {
            resolveRequest = () => resolve({ id: 1, name: 'Zeta', programsCount: 0 });
        });
        mockedProgramsCategoriesApi.editProgramCategory.mockReturnValue(longRunningPromise as any);

        renderEdit();

        typeName('Zetaa');
        const saveButton = getSaveButton();
        expect(saveButton).not.toBeDisabled();

        fireEvent.click(saveButton);
        fireEvent.click(screen.getByText('Yes'));

        await waitFor(() => {
            expect(saveButton).toBeDisabled();
            expect(getSelectButton()).toBeDisabled();
            expect(getNameInput()).toBeDisabled();
        });

        await act(async () => {
            resolveRequest();
            await longRunningPromise;
        });
    });

    it('shows duplicate name hint and disables Save when name matches other category', () => {
        renderEdit();

        typeName('Beta');
        expect(getSaveButton()).toBeDisabled();
        expect(
            screen.getByText(PROGRAM_CATEGORY_VALIDATION.name.getCategoryWithThisNameAlreadyExistsError()),
        ).toBeInTheDocument();
    });
});
