import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProgramExpensesSection } from './ProgramExpensesSection';
import { FUNDS_EXPENDITURES_TEXT, PROGRAM_EXPENSES_TEXT, REPORTS_TEXT } from '@/const/admin/reports';
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
        totalAmountUah: 123750,
        totalAmountUsd: 3000,
    },
    records: [
        {
            id: 1,
            programId: 1,
            programName: 'Program A',
            type: 'expense',
            reportingYear: '2025',
            amountUah: '49500',
            amountUsd: '1200',
        },
        {
            id: 2,
            programId: 1,
            programName: 'Program A',
            type: 'expense',
            reportingYear: '2024',
            amountUah: '24750',
            amountUsd: '600',
        },
        {
            id: 3,
            programId: 2,
            programName: 'Program B',
            type: 'expense',
            reportingYear: '2025',
            amountUah: '49500',
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
const mockPost = jest.fn();
const mockUpdate = jest.fn();
jest.mock('@/services/api/admin/reports/program-expenses-api', () => ({
    ProgramExpensesApi: {
        getReadOnlyData: (...args: unknown[]) => mockGetReadOnlyData(...args),
        delete: jest.fn(),
        bulkDelete: jest.fn(),
        post: (...args: unknown[]) => mockPost(...args),
        update: (...args: unknown[]) => mockUpdate(...args),
    },
}));

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => 'mock-client',
}));

const mockAddProgramCategory = jest.fn();
jest.mock('@/services/api/admin/programs/programs-api', () => ({
    ProgramsCategoriesApi: {
        addProgramCategory: (...args: unknown[]) => mockAddProgramCategory(...args),
    },
}));

jest.mock('@/components/common/select/Select', () => {
    const React = require('react');

    const stringifyValueForTestId = (value: unknown): string => {
        if (value === undefined) return 'undefined';
        if (value === null) return 'null';

        if (typeof value === 'string') return value;
        if (typeof value === 'number' || typeof value === 'boolean') return value.toString();

        return 'non-primitive';
    };

    const SelectOption = (_props: { value: unknown; name: string }) => null;

    const MockSelect = ({
        children,
        onValueChange,
        placeholder,
    }: {
        children: React.ReactNode;
        onValueChange: (value: unknown) => void;
        placeholder?: string;
    }) => {
        const options = React.Children.toArray(children).filter(Boolean) as Array<{
            props: { value: unknown; name: string };
        }>;

        return (
            <div data-testid={`select-${placeholder}`}>
                {options.map((option, index) => (
                    <button
                        key={`${option.props.name}-${index}`}
                        type="button"
                        data-testid={`select-option-${option.props.name}-${stringifyValueForTestId(option.props.value)}`}
                        onClick={() => onValueChange(option.props.value)}
                    >
                        {option.props.name}
                    </button>
                ))}
            </div>
        );
    };

    MockSelect.Option = SelectOption;

    return { Select: MockSelect };
});

const mockAddToast = jest.fn();
jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({ addToast: mockAddToast }),
}));

const mockRefetch = jest.fn().mockReturnValue(Promise.resolve());
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
    AddProgramExpenseRecordModal: ({
        isOpen,
        exchangeRate,
        onSubmit,
        recordToEdit,
    }: {
        isOpen: boolean;
        exchangeRate: string | null;
        onSubmit: (submitData: {
            programId: number | undefined;
            programName: string;
            reportingYear: string;
            amountUah: string;
            amountUsd: string;
        }) => Promise<boolean>;
        recordToEdit?: { id: number } | null;
    }) => (
        <div data-testid="add-program-expense-modal" data-open={String(isOpen)} data-exchange-rate={exchangeRate ?? ''}>
            AddProgramExpenseRecordModal
            {isOpen && (
                <>
                    {recordToEdit && <span data-testid="record-to-edit">{recordToEdit.id}</span>}
                    <button
                        data-testid="mock-submit-btn"
                        onClick={() =>
                            onSubmit({
                                programId: recordToEdit ? 3 : 2,
                                programName: recordToEdit ? 'Program C' : 'Program B',
                                reportingYear: recordToEdit ? '2027' : '2026',
                                amountUah: recordToEdit ? '2 000' : '1 000',
                                amountUsd: recordToEdit ? '50' : '25',
                            })
                        }
                    >
                        Submit Modal
                    </button>
                    <button
                        data-testid="mock-submit-new-category-btn"
                        onClick={() =>
                            onSubmit({
                                programId: undefined,
                                programName: 'New Category',
                                reportingYear: '2026',
                                amountUah: '1 000',
                                amountUsd: '25',
                            })
                        }
                    >
                        Submit New Category
                    </button>
                </>
            )}
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
        mockRefetch.mockReturnValue(Promise.resolve());
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

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });

    it('should render summary, toolbar and all records by default', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.SUMMARY_CARD.TITLE)).toBeInTheDocument();
        expect(screen.getByText('41.25')).toBeInTheDocument();

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(4);
        expect(within(table).getAllByText('Program A')).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
    });

    it('should filter table records by selected program', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

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
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByTestId('program-select-first-two'));

        const table = screen.getByRole('table');
        const rows = within(table).getAllByRole('row');

        expect(rows).toHaveLength(4);
        expect(within(table).getAllByText('Program A')).toHaveLength(2);
        expect(within(table).getByText('Program B')).toBeInTheDocument();
        expect(within(table).queryByText('Program C')).not.toBeInTheDocument();
    });

    it('should restore all table records when selected programs are cleared', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

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
        const { rerender } = render(<ProgramExpensesSection exchangeRate={'41.25'} />);

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

        rerender(<ProgramExpensesSection exchangeRate={'41.25'} />);

        await waitFor(() => {
            expect(within(screen.getByRole('table')).getAllByText('Program A')).toHaveLength(2);
        });
        expect(screen.queryByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).not.toBeInTheDocument();
    });

    it('should refetch read-only data with true when isEditing changes from true to false', () => {
        const { rerender } = render(<ProgramExpensesSection isEditing={true} exchangeRate="41.25" />);

        expect(mockRefetch).not.toHaveBeenCalledWith(true);
        rerender(<ProgramExpensesSection isEditing={false} exchangeRate="41.25" />);
        expect(mockRefetch).toHaveBeenCalledWith(true);
    });

    it('should render filtered empty state when selected program has no matching records', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByTestId('program-select-no-records'));

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.MESSAGE)).toBeInTheDocument();

        const table = screen.getByTestId('program-expenses-table');
        expect(
            within(table).queryByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE }),
        ).toBeNull();
    });

    it('should render program expenses empty state when records are missing', () => {
        mockUseDataFetchResult = {
            data: EMPTY_PROGRAM_EXPENSES_DATA,
            isLoading: false,
            refetch: mockRefetch,
        };

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        expect(screen.getByText(FUNDS_EXPENDITURES_TEXT.TABLE.EMPTY_STATE.TITLE)).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.EMPTY_STATE.ADD_RECORD)).toBeInTheDocument();

        const addButtons = screen.getAllByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE });
        expect(addButtons[0]).toBeEnabled();
        expect(addButtons[1]).toBeEnabled();
    });

    it('should pass fetch handler that calls ProgramExpensesApi.getReadOnlyData with client', async () => {
        mockGetReadOnlyData.mockResolvedValue(MOCK_PROGRAM_EXPENSES_DATA);

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

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
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeEnabled();
        expect(screen.getByRole('checkbox', { name: 'Select all program expense records' })).toBeEnabled();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.TABLE.COLUMNS.ACTIONS)).toBeInTheDocument();
    });

    it('should display mock exchange rate in edit mode', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

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

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        expect(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE })).toBeDisabled();
    });

    it('should open delete confirmation modal when delete icon is clicked', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));

        expect(screen.getByTestId('delete-record-modal')).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.MODAL.DELETE.TITLE)).toBeInTheDocument();
    });

    it('should not show delete icons when not in edit mode', () => {
        render(<ProgramExpensesSection isEditing={false} exchangeRate={'41.25'} />);

        expect(screen.queryByLabelText('Delete record 1')).not.toBeInTheDocument();
    });

    it('should close delete modal when Cancel is clicked without calling API', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));
        expect(screen.getByTestId('delete-record-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO));

        expect(screen.queryByTestId('delete-record-modal')).not.toBeInTheDocument();
        expect(ProgramExpensesApi.delete).not.toHaveBeenCalled();
    });

    it('should delete record after confirmation and show success toast', async () => {
        (ProgramExpensesApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

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

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(ProgramExpensesApi.delete).toHaveBeenCalledWith('mock-client', 1);
            expect(mockAddToast).toHaveBeenCalledWith(
                PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_DELETE_FAILED_RETRY,
                'error',
                5000,
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

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByLabelText('Delete record 1'));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeDisabled();
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeDisabled();
        });

        resolveDelete();
    });

    it('should open bulk delete modal when delete selected button is clicked', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));
        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));

        expect(screen.getByTestId('delete-record-modal')).toBeInTheDocument();
        expect(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_CONFIRM_TITLE)).toBeInTheDocument();
    });

    it('should close bulk delete modal and clear selection when cancel is clicked', () => {
        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));
        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO));

        expect(screen.queryByTestId('delete-record-modal')).not.toBeInTheDocument();
        expect(ProgramExpensesApi.bulkDelete).not.toHaveBeenCalled();
    });

    it('should bulk delete selected records and show success toast', async () => {
        (ProgramExpensesApi.bulkDelete as jest.Mock).mockResolvedValueOnce(undefined);

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

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

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));
        fireEvent.click(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON));
        fireEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(PROGRAM_EXPENSES_TEXT.BULK.DELETE_FAILED, 'error', 5000);
            expect(screen.queryByTestId('delete-record-modal')).not.toBeInTheDocument();
        });
    });

    describe('add and edit flow integration', () => {
        beforeEach(() => {
            mockPost.mockReset();
            mockUpdate.mockReset();
            mockAddProgramCategory.mockReset();
        });

        it('should open modal in add mode, submit, call API.post and refetch', async () => {
            mockPost.mockResolvedValueOnce(undefined);

            render(<ProgramExpensesSection exchangeRate={'41.25'} />);

            fireEvent.click(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE }));

            expect(screen.getByTestId('add-program-expense-modal')).toBeInTheDocument();
            expect(screen.queryByTestId('record-to-edit')).not.toBeInTheDocument();

            fireEvent.click(screen.getByTestId('mock-submit-btn'));

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('mock-client', {
                    reportingYear: 2026,
                    hippotherapyProgramCategoryId: 2,
                    amountUah: 1000,
                    amountUsd: 25,
                });
                expect(mockAddProgramCategory).not.toHaveBeenCalled();
                expect(mockAddToast).toHaveBeenCalledWith(
                    PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_CREATED_SUCCESSFULLY,
                    'success',
                );
                expect(mockRefetch).toHaveBeenCalled();
                expect(screen.getByTestId('add-program-expense-modal')).toHaveAttribute('data-open', 'false');
            });
        });

        it('should create a new program category first when programId is undefined, then post the record', async () => {
            mockAddProgramCategory.mockResolvedValueOnce({ id: 99, name: 'New Category', programsCount: 0 });
            mockPost.mockResolvedValueOnce(undefined);

            render(<ProgramExpensesSection exchangeRate={'41.25'} />);

            fireEvent.click(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE }));
            fireEvent.click(screen.getByTestId('mock-submit-new-category-btn'));

            await waitFor(() => {
                expect(mockAddProgramCategory).toHaveBeenCalledWith({ id: null, name: 'New Category' }, 'mock-client');
                expect(mockPost).toHaveBeenCalledWith('mock-client', {
                    reportingYear: 2026,
                    hippotherapyProgramCategoryId: 99,
                    amountUah: 1000,
                    amountUsd: 25,
                });
                expect(mockAddToast).toHaveBeenCalledWith(
                    PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_CREATED_SUCCESSFULLY,
                    'success',
                );
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('should show error toast and not call API.post when creating the new category fails', async () => {
            mockAddProgramCategory.mockRejectedValueOnce(new Error('failed to create category'));

            render(<ProgramExpensesSection exchangeRate={'41.25'} />);

            fireEvent.click(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE }));
            fireEvent.click(screen.getByTestId('mock-submit-new-category-btn'));

            await waitFor(() => {
                expect(mockPost).not.toHaveBeenCalled();
                expect(mockAddToast).toHaveBeenCalledWith(
                    PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_CREATE_FAILED_RETRY,
                    'error',
                );
            });
        });

        it('should start inline row edit mode, select program category, click accept, call API.update and refetch', async () => {
            mockUpdate.mockResolvedValueOnce(undefined);

            render(<ProgramExpensesSection exchangeRate={'41.25'} />);

            // Click the edit button on the first record (id: 1)
            fireEvent.click(screen.getByLabelText('Edit record 1'));

            // The row action buttons should switch to Accept/Cancel
            expect(screen.getByLabelText('Accept record 1')).toBeInTheDocument();
            expect(screen.getByLabelText('Close edit for record 1')).toBeInTheDocument();

            // Select program C (id: 3)
            fireEvent.click(screen.getByTestId('select-option-Program C-3'));

            const acceptButton = screen.getByLabelText('Accept record 1');
            expect(acceptButton).not.toBeDisabled();

            fireEvent.click(acceptButton);

            await waitFor(() => {
                expect(mockUpdate).toHaveBeenCalledWith('mock-client', 1, {
                    reportingYear: 2025,
                    hippotherapyProgramCategoryId: 3,
                    amountUah: 49500,
                    amountUsd: 1200,
                });
                expect(mockAddToast).toHaveBeenCalledWith(REPORTS_TEXT.MESSAGE.RECORD_UPDATED_SUCCESSFULLY, 'success');
                expect(mockRefetch).toHaveBeenCalled();
            });
        });

        it('should cancel inline edit when isEditing turns off', () => {
            const { rerender } = render(<ProgramExpensesSection isEditing exchangeRate={'41.25'} />);

            fireEvent.click(screen.getByLabelText('Edit record 1'));
            expect(screen.getByLabelText('Accept record 1')).toBeInTheDocument();

            rerender(<ProgramExpensesSection isEditing={false} exchangeRate={'41.25'} />);
            expect(screen.queryByLabelText('Accept record 1')).not.toBeInTheDocument();
        });

        it('should clear bulk selection and hide bulk selection bar when row edit starts', async () => {
            render(<ProgramExpensesSection exchangeRate={'45'} />);

            fireEvent.click(screen.getByRole('checkbox', { name: 'Select record 1' }));
            expect(screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON)).toBeInTheDocument();

            fireEvent.click(screen.getByLabelText('Edit record 1'));

            await waitFor(() => {
                const deleteButton = screen.getByText(PROGRAM_EXPENSES_TEXT.BULK.DELETE_BUTTON);
                const selectionRow = deleteButton.closest('div')?.parentElement;
                expect(selectionRow).toHaveAttribute('aria-hidden', 'true');
                expect(screen.getByRole('checkbox', { name: 'Select record 1' })).not.toBeChecked();
                expect(screen.getByRole('checkbox', { name: 'Select record 1' })).toBeDisabled();
            });
        });
    });

    it('should show error toast if inline record update fails (catch branch)', async () => {
        jest.spyOn(ProgramExpensesApi, 'update').mockRejectedValueOnce(new Error('Network error'));

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByLabelText('Edit record 1'));

        fireEvent.click(screen.getByTestId('select-option-Program C-3'));

        const uahInput = screen.getByLabelText('Amount UAH record 1');
        fireEvent.change(uahInput, { target: { value: '99999' } });

        fireEvent.click(screen.getByLabelText('Accept record 1'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                REPORTS_TEXT.MESSAGE.RECORD_UPDATE_FAILED_RETRY,
                expect.anything(),
            );
        });
    });

    it('should show error toast if adding a new program expense fails (catch branch)', async () => {
        jest.spyOn(ProgramExpensesApi, 'post').mockRejectedValueOnce(new Error('API failed'));

        render(<ProgramExpensesSection exchangeRate={'41.25'} />);

        fireEvent.click(screen.getByRole('button', { name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE }));

        fireEvent.click(screen.getByTestId('mock-submit-btn'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                PROGRAM_EXPENSES_TEXT.MESSAGE.RECORD_CREATE_FAILED_RETRY,
                expect.anything(),
            );
        });
    });

    it('should use exchange rate from parent component in edit mode', () => {
        render(<ProgramExpensesSection isEditing exchangeRate="45" />);

        expect(screen.getByTestId('add-program-expense-modal')).toHaveAttribute('data-exchange-rate', '45');
    });

    it('should use exchange rate from read-only data in non-edit mode', () => {
        mockUseDataFetchResult = {
            data: {
                ...MOCK_PROGRAM_EXPENSES_DATA,
                exchangeRate: '40.50',
            },
            isLoading: false,
            refetch: mockRefetch,
        };

        render(<ProgramExpensesSection isEditing={false} exchangeRate="41.25" />);

        expect(screen.getByTestId('add-program-expense-modal')).toHaveAttribute('data-exchange-rate', '40.50');
    });

    it('should disable add program expense control when exchange rate is invalid', () => {
        render(<ProgramExpensesSection isEditing exchangeRate="invalid" />);

        expect(
            screen.getByRole('button', {
                name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE,
            }),
        ).toBeDisabled();
    });

    it('should disable row actions when exchange rate is invalid', () => {
        render(<ProgramExpensesSection isEditing exchangeRate="invalid" />);

        expect(screen.getByLabelText('Edit record 1')).toBeDisabled();
        expect(screen.getByLabelText('Delete record 1')).toBeDisabled();
    });

    it('should disable add button in empty state when exchange rate has an error', () => {
        mockUseDataFetchResult = {
            data: EMPTY_PROGRAM_EXPENSES_DATA,
            isLoading: false,
            refetch: mockRefetch,
        };

        render(<ProgramExpensesSection isEditing exchangeRate="invalid" />);

        const addButtons = screen.getAllByRole('button', {
            name: PROGRAM_EXPENSES_TEXT.BUTTON.ADD_PROGRAM_EXPENSE,
        });

        expect(addButtons[1]).toBeDisabled();
    });
});
