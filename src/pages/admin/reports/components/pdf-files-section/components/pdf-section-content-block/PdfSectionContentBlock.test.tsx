import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdfSectionContentBlock } from './PdfSectionContentBlock';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { PdfSectionApi } from '@/services/api/admin/reports/pdf-section/pdf-section-api';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ToastType } from '@/types/admin/toast';

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));
jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title, isButtonsDisabled }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal" role="dialog">
                <h2>{title}</h2>
                <button onClick={onCancel} disabled={isButtonsDisabled}>
                    НІ
                </button>
                <button onClick={onConfirm} disabled={isButtonsDisabled}>
                    ТАК
                </button>
            </div>
        ) : null,
}));

const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const MOCK_CONTENT = {
    title: 'Test Section Title',
    description: 'Test Section Description',
};

async function enterEditMode(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT }));
}

async function changeTitle(user: ReturnType<typeof userEvent.setup>, newTitle: string) {
    const titleInput = screen.getByLabelText(/заголовок/i);
    await user.clear(titleInput);
    await user.type(titleInput, newTitle);
    await user.tab();
}

async function clickPublish(user: ReturnType<typeof userEvent.setup>) {
    const publishButton = screen.getByRole('button', {
        name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
    });
    await waitFor(() => expect(publishButton).toBeEnabled());
    await user.click(publishButton);
}

async function confirmModal(user: ReturnType<typeof userEvent.setup>) {
    const confirmButton = await screen.findByText('ТАК');
    await user.click(confirmButton);
}

async function openPublishModal(user: ReturnType<typeof userEvent.setup>, title = 'Updated Title') {
    await enterEditMode(user);
    await changeTitle(user, title);
    await clickPublish(user);
}

describe('PdfSectionContentBlock', () => {
    const mockAddToast = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseToast.mockReturnValue({ addToast: mockAddToast } as any);
        jest.spyOn(PdfSectionApi, 'updatePdfSection').mockResolvedValue({} as any);
    });

    describe('View Mode', () => {
        it('should render title and description in view mode', () => {
            render(<PdfSectionContentBlock content={MOCK_CONTENT} />);
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.TITLE)).toBeInTheDocument();
            expect(screen.getByText(MOCK_CONTENT.title)).toBeInTheDocument();
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.DESCRIPTION)).toBeInTheDocument();
            expect(screen.getByText(MOCK_CONTENT.description)).toBeInTheDocument();
        });

        it('should apply correct classes for view mode', () => {
            const { container } = render(<PdfSectionContentBlock content={MOCK_CONTENT} />);
            expect(container.firstChild).toHaveClass('root', 'view-root');
            expect(screen.getByText(MOCK_CONTENT.title)).toHaveClass('view-text', 'view-text-title');
        });

        it('should render edit button', () => {
            render(<PdfSectionContentBlock content={MOCK_CONTENT} />);
            expect(screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT })).toBeInTheDocument();
        });
    });

    async function renderAndEnterEditMode() {
        render(<PdfSectionContentBlock content={MOCK_CONTENT} />);
        const user = userEvent.setup();
        await enterEditMode(user);
        return user;
    }

    describe('Edit Mode', () => {
        it('should switch to edit mode when edit button is clicked', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={MOCK_CONTENT} />);
            await enterEditMode(user);
            expect(screen.getByDisplayValue(MOCK_CONTENT.title)).toBeInTheDocument();
            expect(screen.getByDisplayValue(MOCK_CONTENT.description)).toBeInTheDocument();
        });

        it('should display form labels in edit mode', async () => {
            await renderAndEnterEditMode();
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.TITLE)).toBeInTheDocument();
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.DESCRIPTION)).toBeInTheDocument();
        });

        it('should display publish and cancel buttons', async () => {
            await renderAndEnterEditMode();
            expect(
                screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }),
            ).toBeInTheDocument();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL })).toBeInTheDocument();
        });

        it('should disable publish button when form is unchanged', async () => {
            await renderAndEnterEditMode();
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        });

        it('should enable publish button when form changes are made', async () => {
            const user = await renderAndEnterEditMode();
            await changeTitle(user, 'New Title Updated');
            await waitFor(() =>
                expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled(),
            );
        });

        it('should cancel edit and return to view mode', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={MOCK_CONTENT} />);
            await enterEditMode(user);
            await changeTitle(user, 'New Title');
            await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));
            await confirmModal(user);
            expect(screen.queryByDisplayValue('New Title')).not.toBeInTheDocument();
            expect(screen.getByText(MOCK_CONTENT.title)).toBeInTheDocument();
        });

        it('should call onSave when publish button is clicked with valid data', async () => {
            const user = userEvent.setup();
            const mockOnSave = jest.fn().mockResolvedValue(undefined);
            render(<PdfSectionContentBlock content={MOCK_CONTENT} onSave={mockOnSave} />);
            await openPublishModal(user);
            await confirmModal(user);
            await waitFor(() =>
                expect(mockOnSave).toHaveBeenCalledWith({
                    title: 'Updated Title',
                    description: MOCK_CONTENT.description,
                }),
            );
        });

        it('should have character counters for both fields', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={MOCK_CONTENT} />);
            await enterEditMode(user);
            expect(screen.getAllByText(/\//).length).toBeGreaterThan(0);
        });
    });

    describe('Confirmation Modal', () => {
        it('should open confirmation modal when publish button is clicked with valid changes', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={MOCK_CONTENT} />);
            await openPublishModal(user);
            expect(await screen.findByTestId('confirmation-modal')).toBeInTheDocument();
            expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();
        });

        it('should close modal and not save when clicking НІ button', async () => {
            const user = userEvent.setup();
            const mockOnSave = jest.fn();
            render(<PdfSectionContentBlock content={MOCK_CONTENT} onSave={mockOnSave} />);
            await openPublishModal(user);
            const modal = await screen.findByTestId('confirmation-modal');
            await user.click(screen.getByText('НІ'));
            await waitFor(() => expect(modal).not.toBeInTheDocument());
            expect(mockOnSave).not.toHaveBeenCalled();
            expect(mockAddToast).not.toHaveBeenCalled();
        });

        it('should save and show success toast when clicking ТАК button', async () => {
            const user = userEvent.setup();
            const mockOnSave = jest.fn().mockResolvedValue(undefined);
            render(<PdfSectionContentBlock content={MOCK_CONTENT} onSave={mockOnSave} />);
            await openPublishModal(user);
            await confirmModal(user);
            await waitFor(() =>
                expect(mockOnSave).toHaveBeenCalledWith({
                    title: 'Updated Title',
                    description: MOCK_CONTENT.description,
                }),
            );
            expect(mockAddToast).toHaveBeenCalledWith('Зміни успішно опубліковані', ToastType.Success);
        });

        it('should revert to view mode after successful save', async () => {
            const user = userEvent.setup();
            const mockOnSave = jest.fn().mockResolvedValue(undefined);
            render(<PdfSectionContentBlock content={MOCK_CONTENT} onSave={mockOnSave} />);
            await openPublishModal(user);
            await confirmModal(user);
            await waitFor(() => expect(screen.queryByDisplayValue('Updated Title')).not.toBeInTheDocument());
            expect(screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT })).toBeInTheDocument();
        });

        it('should disable modal buttons during save', async () => {
            const user = userEvent.setup();
            let resolveSave!: () => void;
            const savePromise = new Promise<void>((resolve) => {
                resolveSave = resolve;
            });
            const mockOnSave = jest.fn(() => savePromise);
            jest.spyOn(PdfSectionApi, 'updatePdfSection').mockReturnValue(savePromise as any);
            render(<PdfSectionContentBlock content={MOCK_CONTENT} onSave={mockOnSave} />);
            await openPublishModal(user);
            await screen.findByText('ТАК');
            resolveSave();
        });
    });

    describe('Cancel Changes Modal', () => {
        it('should cancel without modal when no changes made', async () => {
            const user = await renderAndEnterEditMode();
            await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT })).toBeInTheDocument();
        });

        it('should open cancel confirmation modal when changes made', async () => {
            const user = await renderAndEnterEditMode();
            await changeTitle(user, 'Updated Title');
            await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));
            expect(await screen.findByTestId('confirmation-modal')).toBeInTheDocument();
            expect(
                screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
            ).toBeInTheDocument();
        });

        it('should close modal and keep edit mode when clicking НІ in cancel modal', async () => {
            const user = await renderAndEnterEditMode();
            await changeTitle(user, 'Updated Title');
            await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));
            const modal = await screen.findByTestId('confirmation-modal');
            await user.click(screen.getByText('НІ'));
            await waitFor(() => expect(modal).not.toBeInTheDocument());
            expect(screen.getByDisplayValue('Updated Title')).toBeInTheDocument();
        });

        it('should revert changes when clicking ТАК in cancel modal', async () => {
            const user = await renderAndEnterEditMode();
            await changeTitle(user, 'Updated Title');
            await user.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.CANCEL }));
            await confirmModal(user);
            expect(screen.queryByDisplayValue('Updated Title')).not.toBeInTheDocument();
            expect(screen.getByText(MOCK_CONTENT.title)).toBeInTheDocument();
        });
    });
});
