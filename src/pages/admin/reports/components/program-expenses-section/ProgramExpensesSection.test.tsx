import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesSection } from './ProgramExpensesSection';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT } from '@/const/admin/reports';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ProgramExpensesReadOnlyData } from '@/types/admin/reports';
import { ProgramExpensesApi } from '@/services/api/admin/reports/program-expenses-api';

const MOCK_PROGRAM_EXPENSES_DATA: ProgramExpensesReadOnlyData = {
    exchangeRate: '41.25',
    programs: [
        { id: 1, name: 'Program A' },
        { id: 2, name: 'Program B' },
        { id: 3, name: 'Program C' },
    ],
    summary: {
        totalAmountUah: 125000,
        totalAmountUsd: 3000,
    },
    records: [
        {
            id: 1,
            programId: 1,
            programName: 'Program A',
            type: 'expense',
            reportingYear: '2025',
            amountUah: '50000',
            amountUsd: '1200',
        },
        {
            id: 2,
            programId: 1,
            programName: 'Program A',
            type: 'expense',
            reportingYear: '2024',
            amountUah: '25000',
            amountUsd: '600',
        },
        {
            id: 3,
            programId: 2,
            programName: 'Program B',
            type: 'expense',
            reportingYear: '2025',
            amountUah: '50000',
            amountUsd: '1200',
        },
    ],
};

const EMPTY_PROGRAM_EXPENSES_DATA: ProgramExpensesReadOnlyData = {
    exchangeRate: null,
    programs: [],
    summary: {
        totalAmountUah: 0,
        totalAmountUsd: 0,
    },
    records: [],
};

const mockGetReadOnlyData = jest.fn();
jest.mock('@/services/api/admin/reports/program-expenses-api', () => ({
    ProgramExpensesApi: {
        getReadOnlyData: (...args: unknown[]) => mockGetReadOnlyData(...args),
        delete: jest.fn(),
        post: jest.fn(),
        bulkDelete: jest.fn(),
    },
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => 'mock-client',
}));

const mockAddToast = jest.fn();
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({ addToast: mockAddToast }),
}));

const mockRefetch = jest.fn();
let mockUseDataFetchResult = {
    data: MOCK_PROGRAM_EXPENSES_DATA,
    isLoading: false,
    refetch: mockRefetch,
};

const mockUseDataFetch = jest.fn();
jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: (props: unknown) => mockUseDataFetch(props),
}));

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: ({ size }: { size?: number }) => <div data-testid="inline-loader">loader-{size ?? 2}</div>,
}));

jest.mock('@/assets/icons/not-found.svg', () => ({
    ReactComponent: () => <svg data-testid="not-found-icon" />,
}));

jest.mock('@/assets/icons/plus.svg', () => ({
    ReactComponent: () => <svg data-testid="plus-icon" />,
}));

jest.mock('./components/common/add-program-expense-record-modal/AddProgramExpenseRecordModal', () => ({
    AddProgramExpenseRecordModal: ({ isOpen, exchangeRate }: { isOpen: boolean; exchangeRate: string | null }) => (
        <div data-testid="add-program-expense-modal" data-open={String(isOpen)} data-exchange-rate={exchangeRate ?? ''}>
            AddProgramExpenseRecordModal
        </div>
    ),
}));

jest.mock('../funds-expenditures-section/components/common/delete-record-modal/DeleteRecordModal', () => ({
    DeleteRecordModal: ({
        isOpen,
        title,
        confirmText,
        cancelText,
        isButtonsDisabled,
        onConfirm,
        onCancel,
    }: {
        isOpen: boolean;
        title: string;
        confirmText: string;
        cancelText: string;
        isButtonsDisabled?: boolean;
        onConfirm: () => void;
        onCancel: () => void;
    }) => {
        if (!isOpen) return null;
        return (
            <div data-testid="delete-record-modal">
                <span>{title}</span>
                <button onClick={onConfirm} disabled={isButtonsDisabled}>
                    {confirmText}
                </button>
                <button onClick={onCancel} disabled={isButtonsDisabled}>
                    {cancelText}
                </button>
            </div>
        );
    },
}));

jest.mock('@/components/admin/multi-select-input/MultiSelectInput', () => ({
    MultiSelectInput: ({
        options,
        onChange,
        placeholder,
    }: {
        options: { id: number; name: string }[];
        onChange: (value: { id: number; name: string }[]) => void;
        placeholder?: string;
    }) => {
        const filteredOptions = options.filter((option) => option.id !== 0);

        return (
            <div>
                <select
                    data-testid="program-select"
                    aria-label={placeholder}
                    defaultValue=""
                    onChange={(event) => {
                        const selectedOption = options.find((option) => option.id === Number(event.target.value));
                        onChange(selectedOption ? [selectedOption] : []);
                    }}
                >
                    <option value="">{placeholder}</option>
                    {filteredOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    data-testid="program-select-first-two"
                    onClick={() => onChange(options.filter((option) => option.id === 1 || option.id === 2))}
                >
                    First two programs
                </button>
                <button
                    type="button"
                    data-testid="program-select-no-records"
                    onClick={() => onChange([options.find((option) => option.id === 3)!])}
                >
                    Program without records
                </button>
                <button type="button" data-testid="program-select-clear" onClick={() => onChange([])}>
                    Clear programs
                </button>
            </div>
        );
    },
}));

describe('ProgramExpensesSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseDataFetchResult = {
            data: MOCK_PROGRAM_EXPENSES_DATA,
            isLoading: false,
            refetch: mockRefetch,
        };
        mockUseDataFetch.mockImplementation(() => mockUseDataFetchResult);
    });

    it('should render loader during initial loading', () => {
        mockUseDataFetchResult = {
            data: {
                exchangeRate: null,
                programs: [],
                summary: {
                    totalAmountUah: 0,
                    totalAmountUsd: 0,
                },
                records: [],
            },
            isLoading: true,
            refetch: mockRefetch,
        };

        render(<ProgramExpensesSection />);

        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should render summary, toolbar and all records by default', () => {
        render(<ProgramExpensesSection />);

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.TITLE)).toBeInTheDocument();
        expect(screen.getByText('41.25')).toBeInTheDocument();

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(4);
        expect(within(table).getAllByText('Program A')).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
    });

    it('should filter table records by selected program', () => {
        render(<ProgramExpensesSection />);

        fireEvent.change(screen.getByTestId('program-select'), {
            target: { value: '2' },
        });

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
        expect(within(table).queryByText('2024')).not.toBeInTheDocument();
    });

    it('should filter table records by multiple selected programs', () => {
        render(<ProgramExpensesSection />);

        fireEvent.click(screen.getByTestId('program-select-first-two'));

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(4);
        expect(within(table).getAllByText('Program A')).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
        expect(within(table).queryByText('Program C')).not.toBeInTheDocument();
    });

    it('should restore all table records when selected programs are cleared', () => {
        render(<ProgramExpensesSection />);

        fireEvent.change(screen.getByTestId('program-select'), {
            target: { value: '2' },
        });
        fireEvent.click(screen.getByTestId('program-select-clear'));

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(4);
        expect(within(table).getAllByText('Program A')).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
    });

    it('should drop selected program ids that are no longer present in programs data', async () => {
        const { rerender } = render(<ProgramExpensesSection />);

        fireEvent.change(screen.getByTestId('program-select'), {
            target: { value: '2' },
        });

        expect(within(screen.getByRole('table')).getByText('Program B')).toBeInTheDocument();

        mockUseDataFetchResult = {
            data: {
                ...MOCK_PROGRAM_EXPENSES_DATA,
                programs: MOCK_PROGRAM_EXPENSES_DATA.programs.filter((program) => program.id !== 2),
                records: MOCK_PROGRAM_EXPENSES_DATA.records.filter((record) => record.programId !== 2),
            },
            isLoading: false,
            refetch: mockRefetch,
        };

        rerender(<ProgramExpensesSection />);

        await waitFor(() => {
            expect(within(screen.getByRole('table')).getAllByText('Program A')).toHaveLength(2);
        });
        expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).not.toBeInTheDocument();
    });

    it('should render filtered empty state when selected program has no matching records', () => {
        render(<ProgramExpensesSection />);

        fireEvent.click(screen.getByTestId('program-select-no-records'));

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeNull();
    });

    it('should render program expenses empty state when records are missing', () => {
        mockUseDataFetchResult = {
            data: EMPTY_PROGRAM_EXPENSES_DATA,
            isLoading: false,
            refetch: mockRefetch,
        };

        render(<ProgramExpensesSection />);

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.EMPTY_STATE.ADD_RECORD)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeDisabled();
    });

    it('should pass fetch handler that calls ProgramExpensesApi.getReadOnlyData with client', async () => {
        mockGetReadOnlyData.mockResolvedValue(MOCK_PROGRAM_EXPENSES_DATA);

        render(<ProgramExpensesSection />);

        const useDataFetchProps = mockUseDataFetch.mock.calls[0][0] as {
            fetchHandler: (options?: unknown) => Promise<ProgramExpensesReadOnlyData>;
        };

        await useDataFetchProps.fetchHandler();
        await useDataFetchProps.fetchHandler({ test: true });

        expect(mockGetReadOnlyData).toHaveBeenCalledWith('mock-client', {});
        expect(ProgramExpensesApi.getReadOnlyData).toBeDefined();
        expect(mockGetReadOnlyData).toHaveBeenCalledWith('mock-client', { test: true });
    });

    it('should render edit mode controls when edit mode is active', () => {
        render(<ProgramExpensesSection isEditing />);

        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeEnabled();
        expect(screen.getByRole('checkbox', { name: 'Select all program expense records' })).toBeEnabled();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.ACTIONS)).toBeInTheDocument();
    });

    it('should display mock exchange rate in edit mode', () => {
        render(<ProgramExpensesSection isEditing />);

        expect(screen.getByText('41.25')).toBeInTheDocument();
        expect(screen.getByTestId('add-program-expense-modal')).toHaveAttribute('data-exchange-rate', '41.25');
    });

    it('should disable add program expense button when four records exist', () => {
        mockUseDataFetchResult = {
            data: {
                ...MOCK_PROGRAM_EXPENSES_DATA,
                records: [
                    ...MOCK_PROGRAM_EXPENSES_DATA.records,
                    {
                        id: 4,
                        programId: 3,
                        programName: 'Program C',
                        type: 'expense',
                        reportingYear: '2025',
                        amountUah: '100',
                        amountUsd: '10',
                    },
                ],
            },
            isLoading: false,
            refetch: mockRefetch,
        };

        render(<ProgramExpensesSection isEditing />);

        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeDisabled();
    });

    it('should open delete confirmation modal when delete icon is clicked', () => {
        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));

        expect(screen.getByTestId('delete-record-modal')).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.DELETE.TITLE)).toBeInTheDocument();
    });

    it('should not show delete icons when not in edit mode', () => {
        render(<ProgramExpensesSection />);

        expect(screen.queryByLabelText('Delete record 1')).not.toBeInTheDocument();
    });

    it('should close delete modal when Cancel is clicked without calling API', () => {
        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));
        expect(screen.getByTestId('delete-record-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO));

        expect(screen.queryByTestId('delete-record-modal')).not.toBeInTheDocument();
        expect(ProgramExpensesApi.delete).not.toHaveBeenCalled();
    });

    it('should delete record after confirmation and show success toast', async () => {
        (ProgramExpensesApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.DELETE.TITLE)).toBeInTheDocument();

        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(ProgramExpensesApi.delete).toHaveBeenCalledWith('mock-client', 1);
            expect(mockAddToast).toHaveBeenCalledWith(
                PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_DELETED_SUCCESSFULLY,
                'success',
            );
            expect(mockRefetch).toHaveBeenCalled();
            expect(screen.queryByTestId('delete-record-modal')).not.toBeInTheDocument();
        });
    });

    it('should show error toast and keep modal open when delete fails', async () => {
        (ProgramExpensesApi.delete as jest.Mock).mockRejectedValueOnce(new Error('delete failed'));

        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(ProgramExpensesApi.delete).toHaveBeenCalledWith('mock-client', 1);
            expect(mockAddToast).toHaveBeenCalledWith(
                PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_DELETE_FAILED_RETRY,
                'error',
            );
            expect(screen.getByTestId('delete-record-modal')).toBeInTheDocument();
        });
    });

    it('should disable modal buttons while delete request is in flight', async () => {
        let resolveDelete!: () => void;
        (ProgramExpensesApi.delete as jest.Mock).mockImplementationOnce(
            () =>
                new Promise<void>((resolve) => {
                    resolveDelete = resolve;
                }),
        );

        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeDisabled();
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeDisabled();
        });

        resolveDelete();
    });

    it('should open bulk delete modal when delete selected button is clicked', () => {
        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));
        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));

        expect(screen.getByTestId('delete-record-modal')).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_CONFIRM_TITLE)).toBeInTheDocument();
    });

    it('should close bulk delete modal and clear selection when cancel is clicked', () => {
        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));
        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO));

        expect(screen.queryByTestId('delete-record-modal')).not.toBeInTheDocument();
        expect(ProgramExpensesApi.bulkDelete).not.toHaveBeenCalled();
    });

    it('should bulk delete selected records and show success toast', async () => {
        (ProgramExpensesApi.bulkDelete as jest.Mock).mockResolvedValueOnce(undefined);

        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));
        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(ProgramExpensesApi.bulkDelete).toHaveBeenCalledWith('mock-client', [1]);
            expect(mockAddToast).toHaveBeenCalledWith(PROGRAM_EXPENSES_TEXT.BULK.DELETE_SUCCESS, 'success');
            expect(mockRefetch).toHaveBeenCalled();
            expect(screen.queryByTestId('delete-record-modal')).not.toBeInTheDocument();
        });
    });

    it('should show error toast when bulk delete fails', async () => {
        (ProgramExpensesApi.bulkDelete as jest.Mock).mockRejectedValueOnce(new Error('failed'));

        render(<ProgramExpensesSection isEditing />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));
        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PROGRAM_EXPENSES_TEXT.BULK.DELETE_FAILED, 'error', 5000);
            expect(screen.queryByTestId('delete-record-modal')).not.toBeInTheDocument();
        });
    });
});
