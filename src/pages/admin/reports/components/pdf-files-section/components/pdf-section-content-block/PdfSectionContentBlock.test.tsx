import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PdfSectionContentBlock } from './PdfSectionContentBlock';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { PdfSectionApi } from '@/services/api/admin/reports/pdf-section/pdf-section-api';

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));

const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('PdfSectionContentBlock', () => {
    const mockContent = {
        title: 'Test Section Title',
        description: 'Test Section Description',
    };

    const mockAddToast = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseToast.mockReturnValue({
            addToast: mockAddToast,
        } as any);
        jest.spyOn(PdfSectionApi, 'updatePdfSection').mockResolvedValue({} as any);
    });

    describe('View Mode', () => {
        it('should render title and description in view mode', () => {
            render(<PdfSectionContentBlock content={mockContent} />);

            expect(screen.getByText(PDF_FILES_SECTION_TEXT.TITLE)).toBeInTheDocument();
            expect(screen.getByText(mockContent.title)).toBeInTheDocument();
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.DESCRIPTION)).toBeInTheDocument();
            expect(screen.getByText(mockContent.description)).toBeInTheDocument();
        });

        it('should apply correct classes for view mode', () => {
            const { container } = render(<PdfSectionContentBlock content={mockContent} />);

            const rootDiv = container.firstChild;
            expect(rootDiv).toHaveClass('root', 'view-root');

            const titleText = screen.getByText(mockContent.title);
            expect(titleText).toHaveClass('view-text', 'view-text-title');
        });

        it('should render edit button', () => {
            render(<PdfSectionContentBlock content={mockContent} />);

            const editButton = screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT });
            expect(editButton).toBeInTheDocument();
        });
    });

    describe('Edit Mode', () => {
        it('should switch to edit mode when edit button is clicked', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={mockContent} />);

            const editButton = screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT });
            await user.click(editButton);

            expect(screen.getByDisplayValue(mockContent.title)).toBeInTheDocument();
            expect(screen.getByDisplayValue(mockContent.description)).toBeInTheDocument();
        });

        it('should display form labels in edit mode', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={mockContent} />);

            const editButton = screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT });
            await user.click(editButton);

            expect(screen.getByText(PDF_FILES_SECTION_TEXT.TITLE)).toBeInTheDocument();
            expect(screen.getByText(PDF_FILES_SECTION_TEXT.DESCRIPTION)).toBeInTheDocument();
        });

        it('should display publish and cancel buttons', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={mockContent} />);

            const editButton = screen.getByRole('button', {
                name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT,
            });

            await user.click(editButton);

            expect(screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.BUTTON.PUBLISH })).toBeInTheDocument();

            expect(screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.BUTTON.CANCEL })).toBeInTheDocument();
        });

        it('should disable publish button when form is unchanged', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={mockContent} />);

            const editButton = screen.getByRole('button', {
                name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT,
            });
            await user.click(editButton);

            const publishButton = screen.getByRole('button', { name: PDF_FILES_SECTION_TEXT.BUTTON.PUBLISH });
            expect(publishButton).toBeDisabled();
        });

        it('should enable publish button when form changes are made', async () => {
            const user = userEvent.setup();

            render(<PdfSectionContentBlock content={mockContent} />);

            await user.click(
                screen.getByRole('button', {
                    name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT,
                }),
            );

            const titleInput = screen.getByLabelText(/заголовок/i);

            await user.clear(titleInput);
            await user.type(titleInput, 'New Title Updated');

            await user.tab();

            const publishButton = screen.getByRole('button', {
                name: PDF_FILES_SECTION_TEXT.BUTTON.PUBLISH,
            });

            await waitFor(() => {
                expect(publishButton).toBeEnabled();
            });
        });

        it('should cancel edit and return to view mode', async () => {
            const user = userEvent.setup();

            render(<PdfSectionContentBlock content={mockContent} />);

            await user.click(
                screen.getByRole('button', {
                    name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT,
                }),
            );

            const titleInput = screen.getByDisplayValue(mockContent.title);

            await user.clear(titleInput);
            await user.type(titleInput, 'New Title');

            await user.click(
                screen.getByRole('button', {
                    name: PDF_FILES_SECTION_TEXT.BUTTON.CANCEL,
                }),
            );

            expect(screen.queryByDisplayValue('New Title')).not.toBeInTheDocument();
            expect(screen.getByText(mockContent.title)).toBeInTheDocument();
        });

        it('should call onSave when publish button is clicked with valid data', async () => {
            const user = userEvent.setup();
            const mockOnSave = jest.fn().mockResolvedValue(undefined);

            render(<PdfSectionContentBlock content={mockContent} onSave={mockOnSave} />);

            await user.click(
                screen.getByRole('button', {
                    name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT,
                }),
            );

            const titleInput = screen.getByLabelText(/заголовок/i);

            await user.clear(titleInput);
            await user.type(titleInput, 'Updated Title');

            await user.tab();

            const publishButton = screen.getByRole('button', {
                name: PDF_FILES_SECTION_TEXT.BUTTON.PUBLISH,
            });

            await waitFor(() => expect(publishButton).toBeEnabled());

            await user.click(publishButton);

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalledWith({
                    title: 'Updated Title',
                    description: mockContent.description,
                });
            });
        });

        it('should have character counters for both fields', async () => {
            const user = userEvent.setup();
            render(<PdfSectionContentBlock content={mockContent} />);

            const editButton = screen.getByRole('button', {
                name: PDF_FILES_SECTION_TEXT.ACTIONS.EDIT,
            });
            await user.click(editButton);

            const counters = screen.getAllByText(/\//);
            expect(counters.length).toBeGreaterThan(0);
        });
    });
});
