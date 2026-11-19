import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { DonatePageContent } from './DonatePageContent';
import { DONATE_TEXT } from '@/const/admin/donate';

const mockUseBankDetails = jest.fn();
const mockUseAdminClient = jest.fn();
const mockGetAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockSetItems = jest.fn();
const mockRefetchBankDetails = jest.fn();
const mockAddToast = jest.fn();

const mockCorrespondentCreate = jest.fn();
const mockCorrespondentUpdate = jest.fn();
const mockCorrespondentDelete = jest.fn();

const mockBankCurrency = {
    Uah: 0,
    Usd: 1,
    Eur: 2,
};

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => mockUseAdminClient(),
}));

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        addToast: mockAddToast,
    }),
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('@/services/api/admin/donate/support-options/support-options-api', () => ({
    SupportOptionsApi: {
        getAll: (...args: any[]) => mockGetAll(...args),
        create: (...args: any[]) => mockCreate(...args),
        update: (...args: any[]) => mockUpdate(...args),
        delete: (...args: any[]) => mockDelete(...args),
    },
}));

jest.mock('@/services/api/admin/donate/correspondent-banks/correspondent-banks-api', () => ({
    CorrespondentBankDetailsApi: {
        create: (...args: any[]) => mockCorrespondentCreate(...args),
        update: (...args: any[]) => mockCorrespondentUpdate(...args),
        delete: (...args: any[]) => mockCorrespondentDelete(...args),
    },
}));

jest.mock('../bank-details-currencies/currencies-manager/CurrenciesManager', () => ({
    Currencies: {
        UAH: 'UAH',
        USD: 'USD',
        EUR: 'EUR',
    },
    useBankDetails: () => mockUseBankDetails(),
    mapCurrencyToBankCurrency: (currency: string) => {
        switch (currency) {
            case 'UAH':
                return 0;
            case 'USD':
                return 1;
            case 'EUR':
                return 2;
            default:
                return currency;
        }
    },
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ onCategorySelect, selectedCategory }: any) => (
        <div data-testid="category-bar">
            <span data-testid="selected-category">{selectedCategory}</span>
            <button onClick={() => onCategorySelect('USD')}>Switch to USD</button>
            <button onClick={() => onCategorySelect('UAH')}>UAH</button>
        </div>
    ),
}));

jest.mock('../generic-details/GenericDetails', () => {
    let instanceCounter = 0;
    return {
        GenericDetails: ({ children, onSubmit, onUpdate, onDelete, items, isChildForm }: any) => {
            const instanceId = instanceCounter++;
            const testId = isChildForm ? 'correspondent-details' : 'generic-details';

            return (
                <div data-testid={testId} data-instance={instanceId}>
                    {onSubmit && (
                        <button data-action="submit" onClick={() => onSubmit({ id: 1 })}>
                            Submit
                        </button>
                    )}
                    {onUpdate && (
                        <button data-action="update" onClick={() => onUpdate(1, { name: 'Updated' })}>
                            Update
                        </button>
                    )}
                    {onDelete && (
                        <button data-action="delete" onClick={() => onDelete(1)}>
                            Delete
                        </button>
                    )}
                    {children &&
                        typeof children === 'function' &&
                        children({ formState: { id: 1 }, isItemsExpanded: false })}
                    {items && <span data-testid="items-count">{items.length}</span>}
                </div>
            );
        },
    };
});

jest.mock('../support-options/support-options-form/SupportOptionsForm', () => ({
    SupportOptionsForm: ({ supportOptions, isLoading, onCreateOption, onUpdateOption, onDeleteOption }: any) => (
        <div data-testid="support-options-form" data-loading={String(isLoading)}>
            <span data-testid="support-options-count">{supportOptions.length}</span>
            <button onClick={() => onCreateOption('Test', '123')}>Create</button>
            <button onClick={() => onUpdateOption(1, 'Updated', '456')}>Update</button>
            <button onClick={() => onDeleteOption(1)}>Delete</button>
        </div>
    ),
}));

jest.mock('../../../../../utils/functions/mappers/admin/donate-mappers', () => ({
    mapToCreateUahBankDetails: (data: any) => {
        const { id: _id, ...rest } = data;
        return rest;
    },
    mapToUpdateUahBankDetails: (data: any) => {
        const { id: _id, ...rest } = data;
        return rest;
    },
    mapToCreateForeignBankDetails: (data: any) => {
        const { id: _id, correspondentBanks: _correspondentBanks, currency: _currency, ...rest } = data;
        return rest;
    },
    mapToUpdateForeignBankDetails: (data: any) => {
        const { id: _id, correspondentBanks: _correspondentBanks, currency: _currency, ...rest } = data;
        return rest;
    },
    mapToCreateCorrespondentBankDetails: (data: any, foreignBankDetailsId: number) => {
        const { id: _id, ...rest } = data;
        return { ...rest, foreignBankDetailsId };
    },
    mapToUpdateCorrespondentBankDetails: (data: any) => {
        const { id: _id, foreignBankDetailsId: _foreignBankDetailsId, ...rest } = data;
        return rest;
    },
}));

describe('DonatePageContent', () => {
    const createMockConfig = (withCorrespondentBanks = false) => ({
        form: jest.fn(),
        create: jest.fn().mockResolvedValue({ id: 1 }),
        update: jest.fn().mockResolvedValue({ id: 1 }),
        delete: jest.fn().mockResolvedValue(undefined),
        withCorrespondentBanks,
        ...(withCorrespondentBanks && { correspondentForm: jest.fn() }),
    });

    const setupMockBankDetails = (
        items: any[] = [],
        config: any = createMockConfig(),
        isLoading = false,
        error: unknown = null,
    ) => {
        mockUseBankDetails.mockReturnValue({
            items,
            config,
            setItems: mockSetItems,
            isLoading,
            error,
            refetch: mockRefetchBankDetails,
        });
    };

    const anyRequestOptions = expect.objectContaining({ cancellationSignal: expect.any(AbortSignal) });

    const renderComponent = () => render(<DonatePageContent />);

    const waitForElement = async (testId: string) => {
        await waitFor(() => {
            expect(screen.getByTestId(testId)).toBeInTheDocument();
        });
    };

    const setupCorrespondentTest = async () => {
        await waitForElement('correspondent-details');
        return screen.getByTestId('correspondent-details');
    };

    const testCorrespondentOperation = async (buttonText: string, mockFn: jest.Mock, expectedArgs: any[]) => {
        const correspondentDetails = await setupCorrespondentTest();
        fireEvent.click(within(correspondentDetails).getByText(buttonText));
        await waitFor(() => {
            expect(mockFn).toHaveBeenCalledWith(...expectedArgs);
        });
    };

    const getSetItemsCallback = () => mockSetItems.mock.calls[0][0];

    const testSetItemsUpdate = (previousItems: any[], assertion: (updatedItems: any[]) => void) => {
        const callback = getSetItemsCallback();
        const updatedItems = callback(previousItems);
        assertion(updatedItems);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAdminClient.mockReturnValue('mockClient');
        setupMockBankDetails();
        mockGetAll.mockResolvedValue([]);
        mockCreate.mockResolvedValue({ id: 1, name: 'Test', value: '123', currency: mockBankCurrency.Uah });
        mockUpdate.mockResolvedValue({ id: 1, name: 'Updated', value: '456', currency: mockBankCurrency.Uah });
        mockDelete.mockResolvedValue(undefined);
        mockCorrespondentCreate.mockResolvedValue({ id: 1 });
        mockCorrespondentUpdate.mockResolvedValue({ id: 1 });
        mockCorrespondentDelete.mockResolvedValue(undefined);
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders component successfully', async () => {
            renderComponent();
            await waitForElement('category-bar');
            expect(screen.getByTestId('support-options-form')).toBeInTheDocument();
            expect(screen.getByTestId('toast-container')).toBeInTheDocument();
        });

        it('renders GenericDetails when config exists', async () => {
            renderComponent();
            await waitForElement('generic-details');
        });

        it('does not render GenericDetails when config is null', async () => {
            setupMockBankDetails([], null);
            renderComponent();
            await waitForElement('category-bar');
            expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
        });

        const correspondentBanksTests = [
            { desc: 'with empty array', banks: [] },
            { desc: 'without correspondentBanks property', banks: undefined },
            { desc: 'with multiple items', banks: [{ id: 10 }, { id: 11 }] },
        ];

        correspondentBanksTests.forEach(({ desc, banks }) => {
            it(`renders correspondent banks ${desc}`, async () => {
                const items = banks === undefined ? [{ id: 1 }] : [{ id: 1, correspondentBanks: banks }];
                setupMockBankDetails(items, createMockConfig(true));
                renderComponent();
                await waitForElement('correspondent-details');

                if (banks?.length) {
                    const itemsCount = within(screen.getByTestId('correspondent-details')).getByTestId('items-count');
                    // eslint-disable-next-line jest/no-conditional-expect
                    expect(itemsCount).toHaveTextContent(String(banks.length));
                }
            });
        });

        it('does not render correspondent banks when withCorrespondentBanks is false', async () => {
            setupMockBankDetails([{ id: 1 }], createMockConfig(false));
            renderComponent();
            await waitForElement('generic-details');
            expect(screen.queryByTestId('correspondent-details')).not.toBeInTheDocument();
        });
    });

    describe('Support Options API', () => {
        it('fetches support options on mount', async () => {
            renderComponent();
            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0, anyRequestOptions);
            });
        });

        it('creates support option successfully', async () => {
            renderComponent();

            const supportOptionsForm = screen.getByTestId('support-options-form');
            fireEvent.click(within(supportOptionsForm).getByText('Create'));

            await waitFor(() => {
                expect(mockCreate).toHaveBeenCalledWith('mockClient', {
                    name: 'Test',
                    value: '123',
                    currency: 0,
                });
            });
        });

        it('updates support option successfully', async () => {
            renderComponent();

            const supportOptionsForm = screen.getByTestId('support-options-form');
            fireEvent.click(within(supportOptionsForm).getByText('Update'));

            await waitFor(() => {
                expect(mockUpdate).toHaveBeenCalledWith('mockClient', 1, {
                    name: 'Updated',
                    value: '456',
                });
            });
        });

        it('deletes support option successfully', async () => {
            renderComponent();

            const supportOptionsForm = screen.getByTestId('support-options-form');
            fireEvent.click(within(supportOptionsForm).getByText('Delete'));

            await waitFor(() => {
                expect(mockDelete).toHaveBeenCalledWith('mockClient', 1);
            });
        });

        it('shows an error with retry instead of the form when the fetch fails', async () => {
            mockGetAll.mockRejectedValue(new Error('Network error'));
            renderComponent();

            await waitForElement('support-options-fetch-error');
            expect(screen.getByText(DONATE_TEXT.SUPPORT_OPTIONS.FAIL_TO_FETCH)).toBeInTheDocument();
            expect(screen.queryByTestId('support-options-form')).not.toBeInTheDocument();
        });

        it('refetches support options on retry and shows the form after success', async () => {
            mockGetAll.mockRejectedValueOnce(new Error('Network error')).mockResolvedValueOnce([]);
            renderComponent();

            await waitForElement('support-options-fetch-error');
            fireEvent.click(screen.getByTestId('support-options-fetch-error-retry'));

            await waitForElement('support-options-form');
            expect(screen.queryByTestId('support-options-fetch-error')).not.toBeInTheDocument();
            expect(mockGetAll).toHaveBeenCalledTimes(2);
        });

        it('shows the error when the support options fetch fails after a category change', async () => {
            mockGetAll.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('Fetch failed'));
            renderComponent();

            await waitFor(() => expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0, anyRequestOptions));
            expect(screen.getByTestId('support-options-form')).toBeInTheDocument();

            fireEvent.click(screen.getByText('Switch to USD'));

            await waitForElement('support-options-fetch-error');
            expect(mockGetAll).toHaveBeenCalledWith('mockClient', 1, anyRequestOptions);
            expect(mockGetAll).toHaveBeenCalledTimes(2);
        });

        it('does not pass the previous currency options to the form while the new currency loads', async () => {
            let resolveUsd: (value: any) => void = () => {};
            mockGetAll
                .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
                .mockReturnValueOnce(new Promise((resolve) => (resolveUsd = resolve)));
            renderComponent();

            await waitFor(() => expect(screen.getByTestId('support-options-count')).toHaveTextContent('2'));

            fireEvent.click(screen.getByText('Switch to USD'));

            expect(screen.getByTestId('support-options-count')).toHaveTextContent('0');
            expect(screen.getByTestId('support-options-form')).toHaveAttribute('data-loading', 'true');

            resolveUsd([{ id: 3 }]);

            await waitFor(() => expect(screen.getByTestId('support-options-count')).toHaveTextContent('1'));
        });

        it('does not show the previous currency options while retrying after an error', async () => {
            let resolveRetry: (value: any) => void = () => {};
            mockGetAll
                .mockResolvedValueOnce([{ id: 1 }, { id: 2 }])
                .mockRejectedValueOnce(new Error('Fetch failed'))
                .mockReturnValueOnce(new Promise((resolve) => (resolveRetry = resolve)));
            renderComponent();

            await waitFor(() => expect(screen.getByTestId('support-options-count')).toHaveTextContent('2'));

            fireEvent.click(screen.getByText('Switch to USD'));
            await waitForElement('support-options-fetch-error');

            fireEvent.click(screen.getByTestId('support-options-fetch-error-retry'));

            await waitForElement('support-options-form');
            expect(screen.getByTestId('support-options-count')).toHaveTextContent('0');

            resolveRetry([{ id: 3 }]);

            await waitFor(() => expect(screen.getByTestId('support-options-count')).toHaveTextContent('1'));
        });

        it('clears the support options error when switching to a category that loads', async () => {
            mockGetAll.mockRejectedValueOnce(new Error('Fetch failed')).mockResolvedValueOnce([]);
            renderComponent();

            await waitForElement('support-options-fetch-error');

            fireEvent.click(screen.getByText('Switch to USD'));

            await waitForElement('support-options-form');
            expect(screen.queryByTestId('support-options-fetch-error')).not.toBeInTheDocument();
        });

        it('calls addToast on successful operations', async () => {
            renderComponent();

            const supportOptionsForm = screen.getByTestId('support-options-form');
            fireEvent.click(within(supportOptionsForm).getByText('Create'));

            await waitFor(() => expect(mockAddToast).toHaveBeenCalled());
        });

        it('handles foreign bank update without correspondentBanks', async () => {
            const mockConfig = createMockConfig(true);
            mockConfig.update.mockResolvedValue({ id: 1, name: 'Updated' });
            setupMockBankDetails([{ id: 1, name: 'Foreign Bank' }], mockConfig);

            renderComponent();
            const updateButton = screen
                .getByTestId('generic-details')
                .querySelector('[data-action="update"]') as HTMLElement;
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockSetItems).toHaveBeenCalled();
            });

            const callback = mockSetItems.mock.calls[0][0];
            const updated = callback([{ id: 1, name: 'Foreign Bank' }]);
            expect(updated[0].correspondentBanks).toEqual([]);
        });
    });

    describe('Category Management', () => {
        it('handles category change', async () => {
            renderComponent();
            await waitFor(() => expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0, anyRequestOptions));

            fireEvent.click(screen.getByText('Switch to USD'));

            await waitFor(() => expect(mockGetAll).toHaveBeenCalledWith('mockClient', 1, anyRequestOptions));
        });

        it('does not change category when selecting the same category', async () => {
            renderComponent();

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledTimes(1);
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0, anyRequestOptions);
            });

            fireEvent.click(screen.getByRole('button', { name: 'UAH' }));
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(mockGetAll).toHaveBeenCalledTimes(1);
        });
    });

    describe('Bank Details fetch error', () => {
        it('shows an error with retry instead of the bank details list and add actions', async () => {
            setupMockBankDetails([], createMockConfig(), false, new Error('Server error'));
            renderComponent();

            await waitForElement('bank-details-fetch-error');
            expect(screen.getByText(DONATE_TEXT.BANK_DETAILS.FAIL_TO_FETCH)).toBeInTheDocument();
            expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
        });

        it('calls refetch when retry is clicked', async () => {
            setupMockBankDetails([], createMockConfig(), false, new Error('Server error'));
            renderComponent();

            await waitForElement('bank-details-fetch-error');
            fireEvent.click(screen.getByTestId('bank-details-fetch-error-retry'));

            expect(mockRefetchBankDetails).toHaveBeenCalledTimes(1);
        });

        it('keeps support options usable when only bank details fail', async () => {
            setupMockBankDetails([], createMockConfig(), false, new Error('Server error'));
            renderComponent();

            await waitForElement('bank-details-fetch-error');
            expect(screen.getByTestId('support-options-form')).toBeInTheDocument();
        });
    });

    describe('Bank Details Operations', () => {
        const bankOperations = [
            { operation: 'Submit', method: 'create', args: ['mockClient', {}] },
            { operation: 'Update', method: 'update', args: ['mockClient', 1, { name: 'Updated' }] },
            { operation: 'Delete', method: 'delete', args: ['mockClient', 1] },
        ];

        bankOperations.forEach(({ operation, method, args }) => {
            it(`calls bank details ${method} correctly`, async () => {
                const mockConfig = createMockConfig();
                setupMockBankDetails([{ id: 1, name: 'Test Bank' }], mockConfig);
                renderComponent();

                const genericDetails = screen.getByTestId('generic-details');
                fireEvent.click(within(genericDetails).getByText(operation));

                await waitFor(() => {
                    expect(mockConfig[method as keyof typeof mockConfig]).toHaveBeenCalledWith(...args);
                });
            });
        });

        it('calls setItems when handlers complete successfully', async () => {
            const mockConfig = createMockConfig();
            setupMockBankDetails([{ id: 1, name: 'Test Bank' }], mockConfig);
            renderComponent();

            fireEvent.click(screen.getByText('Submit'));
            await waitFor(() => expect(mockSetItems).toHaveBeenCalled());
        });

        it('does not call handlers when config is null', async () => {
            setupMockBankDetails([], null);
            renderComponent();
            await waitForElement('category-bar');
            expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
        });
    });

    describe('Correspondent Banks Operations', () => {
        const setupWithCorrespondentBanks = (banks: any[] = [{ id: 10 }]) => {
            const mockConfig = createMockConfig(true);
            setupMockBankDetails([{ id: 1, correspondentBanks: banks }], mockConfig);
            return mockConfig;
        };

        const correspondentOperations = [
            {
                operation: 'creates',
                button: 'Submit',
                mock: mockCorrespondentCreate,
                args: ['mockClient', { foreignBankDetailsId: 1 }],
            },
            {
                operation: 'updates',
                button: 'Update',
                mock: mockCorrespondentUpdate,
                args: ['mockClient', 1, { name: 'Updated' }],
            },
            { operation: 'deletes', button: 'Delete', mock: mockCorrespondentDelete, args: ['mockClient', 1] },
        ];

        correspondentOperations.forEach(({ operation, button, mock, args }) => {
            it(`${operation} correspondent bank successfully`, async () => {
                setupWithCorrespondentBanks();
                renderComponent();
                await testCorrespondentOperation(button, mock, args);

                if (operation === 'deletes') {
                    // eslint-disable-next-line jest/no-conditional-expect
                    expect(mockAddToast).toHaveBeenCalled();
                }
            });
        });
    });

    describe('State Updates', () => {
        it('updates bank details and preserves correspondent banks', async () => {
            const mockConfig = createMockConfig(true);
            mockConfig.update.mockResolvedValue({ id: 1, name: 'Updated Bank' });
            const existingBanks = [{ id: 10, name: 'Correspondent 1' }];
            setupMockBankDetails([{ id: 1, name: 'Test Bank', correspondentBanks: existingBanks }], mockConfig);

            renderComponent();
            const updateButton = screen
                .getByTestId('generic-details')
                .querySelector(':scope > [data-action="update"]') as HTMLElement;
            fireEvent.click(updateButton);

            await waitFor(() => expect(mockSetItems).toHaveBeenCalled());

            testSetItemsUpdate([{ id: 1, name: 'Test Bank', correspondentBanks: existingBanks }], (items) => {
                expect(items[0].correspondentBanks).toEqual(existingBanks);
                expect(items[0].name).toBe('Updated Bank');
            });
        });

        it('handles correspondent bank creation with undefined correspondentBanks', async () => {
            const mockConfig = createMockConfig(true);
            mockCorrespondentCreate.mockResolvedValue({ id: 2, name: 'New' });
            setupMockBankDetails([{ id: 1 }], mockConfig);

            renderComponent();
            const correspondentDetails = await setupCorrespondentTest();
            fireEvent.click(within(correspondentDetails).getByText('Submit'));

            await waitFor(() => expect(mockSetItems).toHaveBeenCalled());

            testSetItemsUpdate([{ id: 1 }], (items) => {
                expect(Array.isArray(items[0].correspondentBanks)).toBe(true);
                expect(items[0].correspondentBanks).toContainEqual({ id: 2, name: 'New' });
            });
        });
    });

    describe('Component Lifecycle', () => {
        it('cleans up useEffect on unmount', async () => {
            const { unmount } = renderComponent();
            await waitFor(() => expect(mockGetAll).toHaveBeenCalled());

            mockGetAll.mockClear();
            unmount();

            expect(mockGetAll).not.toHaveBeenCalled();
        });

        it('prevents state update after unmount', async () => {
            let resolvePromise: (value: any) => void;
            const promise = new Promise((resolve) => {
                resolvePromise = resolve;
            });

            mockGetAll.mockReturnValue(promise);
            const { unmount } = renderComponent();

            await waitFor(() => expect(mockGetAll).toHaveBeenCalled());

            unmount();
            resolvePromise!([{ id: 1 }]);

            await new Promise((resolve) => setTimeout(resolve, 100));
        });
    });
});
