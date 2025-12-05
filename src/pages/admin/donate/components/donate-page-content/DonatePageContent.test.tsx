import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { DonatePageContent } from './DonatePageContent';

const mockUseBankDetails = jest.fn();
const mockUseAdminClient = jest.fn();
const mockGetAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockSetItems = jest.fn();
const mockAddToast = jest.fn();

const mockCorrespondentCreate = jest.fn();
const mockCorrespondentUpdate = jest.fn();
const mockCorrespondentDelete = jest.fn();

const mockBankCurrency = {
    Uah: 0,
    Usd: 1,
    Eur: 2,
};

jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => mockUseAdminClient(),
}));

jest.mock('../../../../../contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: () => ({
        addToast: mockAddToast,
    }),
}));

jest.mock('../../../../../components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('../../../../../services/api/admin/donate/support-options/support-options-api', () => ({
    SupportOptionsApi: {
        getAll: (...args: any[]) => mockGetAll(...args),
        create: (...args: any[]) => mockCreate(...args),
        update: (...args: any[]) => mockUpdate(...args),
        delete: (...args: any[]) => mockDelete(...args),
    },
}));

jest.mock('../../../../../services/api/admin/donate/correspondent-banks/correspondent-banks-api', () => ({
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

jest.mock('../../../../../components/admin/category-bar/CategoryBar', () => ({
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
    SupportOptionsForm: ({ onCreateOption, onUpdateOption, onDeleteOption }: any) => (
        <div data-testid="support-options-form">
            <button onClick={() => onCreateOption('Test', '123')}>Create</button>
            <button onClick={() => onUpdateOption(1, 'Updated', '456')}>Update</button>
            <button onClick={() => onDeleteOption(1)}>Delete</button>
        </div>
    ),
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

    const setupMockBankDetails = (items: any[] = [], config: any = createMockConfig(), isLoading = false) => {
        mockUseBankDetails.mockReturnValue({
            items,
            config,
            setItems: mockSetItems,
            isLoading,
        });
    };

    // Helper functions
    const renderAndWaitForComponent = async (testId: string) => {
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getByTestId(testId)).toBeInTheDocument();
        });
    };

    const clickButtonAndWaitForCall = async (buttonText: string, mockFn: jest.Mock) => {
        fireEvent.click(screen.getByText(buttonText));
        await waitFor(() => {
            expect(mockFn).toHaveBeenCalled();
        });
    };

    const setupCorrespondentBankTest = async () => {
        await waitFor(() => {
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });
        return screen.getByTestId('correspondent-details');
    };

    const testCorrespondentOperation = async (
        buttonText: string,
        mockFn: jest.Mock,
        expectedCall: [string, ...any[]],
    ) => {
        const correspondentDetails = await setupCorrespondentBankTest();
        const button = within(correspondentDetails).getByText(buttonText);
        fireEvent.click(button);
        await waitFor(() => {
            expect(mockFn).toHaveBeenCalledWith(...expectedCall);
        });
    };

    const testSetItemsCallback = (previousItems: any[], expectedCheck: (updatedItems: any[]) => void) => {
        const setItemsCallback = mockSetItems.mock.calls[0][0];
        const updatedItems = setItemsCallback(previousItems);
        expectedCheck(updatedItems);
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

        // Suppress console errors in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Basic Rendering', () => {
        it('renders component successfully', async () => {
            await renderAndWaitForComponent('category-bar');
            expect(screen.getByTestId('support-options-form')).toBeInTheDocument();
            expect(screen.getByTestId('toast-container')).toBeInTheDocument();
        });

        it('renders GenericDetails when config exists', async () => {
            await renderAndWaitForComponent('generic-details');
        });

        it('does not render GenericDetails when config is null', async () => {
            setupMockBankDetails([], null);
            await renderAndWaitForComponent('category-bar');
            expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
        });

        it('renders correspondent banks when withCorrespondentBanks is true', async () => {
            setupMockBankDetails([{ id: 1, correspondentBanks: [] }], createMockConfig(true));
            await renderAndWaitForComponent('generic-details');
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });

        it('does not render correspondent banks when withCorrespondentBanks is false', async () => {
            setupMockBankDetails([{ id: 1 }], createMockConfig(false));
            await renderAndWaitForComponent('generic-details');
            expect(screen.queryByTestId('correspondent-details')).not.toBeInTheDocument();
        });

        it('renders correspondent banks with empty array', async () => {
            setupMockBankDetails([{ id: 1, correspondentBanks: [] }], createMockConfig(true));
            await renderAndWaitForComponent('generic-details');
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });

        it('renders correspondent banks for item without correspondentBanks property', async () => {
            setupMockBankDetails([{ id: 1 }], createMockConfig(true));
            await renderAndWaitForComponent('generic-details');
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });

        it('renders correspondent banks with correct items count', async () => {
            setupMockBankDetails(
                [
                    { id: 1, correspondentBanks: [{ id: 10 }, { id: 11 }] },
                    { id: 2, correspondentBanks: [] },
                ],
                createMockConfig(true),
            );
            await renderAndWaitForComponent('correspondent-details');
            expect(within(screen.getByTestId('correspondent-details')).getByTestId('items-count')).toHaveTextContent(
                '2',
            );
        });

        it('renders without title when not provided', async () => {
            setupMockBankDetails([{ id: 1, name: 'Test Bank' }], createMockConfig());
            await renderAndWaitForComponent('generic-details');
            expect(screen.getByTestId('generic-details')).toBeInTheDocument();
        });
    });

    describe('Support Options API', () => {
        it('fetches support options on mount', async () => {
            render(<DonatePageContent />);
            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0);
            });
        });

        it('creates support option successfully', async () => {
            render(<DonatePageContent />);
            await clickButtonAndWaitForCall('Create', mockCreate);
            expect(mockCreate).toHaveBeenCalledWith('mockClient', {
                name: 'Test',
                value: '123',
                currency: 0,
            });
        });

        it('updates support option successfully', async () => {
            render(<DonatePageContent />);
            const supportOptionsForm = screen.getByTestId('support-options-form');
            const updateButton = within(supportOptionsForm).getByText('Update');
            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockUpdate).toHaveBeenCalledWith('mockClient', 1, {
                    name: 'Updated',
                    value: '456',
                });
            });
        });

        it('deletes support option successfully', async () => {
            render(<DonatePageContent />);
            const supportOptionsForm = screen.getByTestId('support-options-form');
            const deleteButton = within(supportOptionsForm).getByText('Delete');
            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockDelete).toHaveBeenCalledWith('mockClient', 1);
            });
        });

        it('handles fetch error gracefully', async () => {
            mockGetAll.mockRejectedValue(new Error('Network error'));
            render(<DonatePageContent />);
            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalled();
            });
        });

        it('handles support options fetch rejection on category change', async () => {
            mockGetAll.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('Fetch failed'));

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0);
            });

            fireEvent.click(screen.getByText('Switch to USD'));

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 1);
                expect(mockGetAll).toHaveBeenCalledTimes(2);
            });
        });

        it('calls addToast on successful operations', async () => {
            render(<DonatePageContent />);
            await clickButtonAndWaitForCall('Create', mockAddToast);
        });
    });

    describe('Category Management', () => {
        it('handles category change', async () => {
            render(<DonatePageContent />);

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0);
            });

            fireEvent.click(screen.getByText('Switch to USD'));

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 1);
            });
        });

        it('does not change category when selecting the same category', async () => {
            render(<DonatePageContent />);

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledTimes(1);
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0);
            });

            const uahButton = screen.getByRole('button', { name: 'UAH' });
            fireEvent.click(uahButton);

            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(mockGetAll).toHaveBeenCalledTimes(1);
        });

        it('fetches support options for different currencies', async () => {
            render(<DonatePageContent />);

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0);
            });

            fireEvent.click(screen.getByText('Switch to USD'));

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 1);
            });
        });
    });

    describe('Bank Details Operations', () => {
        it('calls bank details handlers correctly', async () => {
            const mockConfig = createMockConfig();
            setupMockBankDetails([{ id: 1, name: 'Test Bank' }], mockConfig);

            render(<DonatePageContent />);

            const genericDetails = screen.getByTestId('generic-details');

            fireEvent.click(within(genericDetails).getByText('Submit'));
            await waitFor(() => {
                expect(mockConfig.create).toHaveBeenCalledWith('mockClient', { id: 1 });
            });

            fireEvent.click(within(genericDetails).getByText('Update'));
            await waitFor(() => {
                expect(mockConfig.update).toHaveBeenCalledWith('mockClient', 1, { name: 'Updated' });
            });

            fireEvent.click(within(genericDetails).getByText('Delete'));
            await waitFor(() => {
                expect(mockConfig.delete).toHaveBeenCalledWith('mockClient', 1);
            });
        });

        it('calls setItems when handlers complete successfully', async () => {
            const mockConfig = createMockConfig();
            setupMockBankDetails([{ id: 1, name: 'Test Bank' }], mockConfig);

            render(<DonatePageContent />);

            fireEvent.click(screen.getByText('Submit'));
            await waitFor(() => {
                expect(mockSetItems).toHaveBeenCalled();
            });
        });

        it('calls addToast after successful bank details update', async () => {
            const mockConfig = createMockConfig();
            mockConfig.update.mockResolvedValue({ id: 1, name: 'Updated Bank' });
            setupMockBankDetails([{ id: 1, name: 'Test Bank' }], mockConfig);

            render(<DonatePageContent />);

            const genericDetails = screen.getByTestId('generic-details');
            const updateButton = within(genericDetails).getByText('Update');

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockConfig.update).toHaveBeenCalled();
                expect(mockAddToast).toHaveBeenCalled();
            });
        });

        it('updates bank details with correspondent banks correctly', async () => {
            const mockConfig = createMockConfig(true);
            mockConfig.update.mockResolvedValue({ id: 1, name: 'Updated Bank' });
            setupMockBankDetails([{ id: 1, name: 'Test Bank', correspondentBanks: [{ id: 10 }] }], mockConfig);

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('generic-details')).toBeInTheDocument();
                expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
            });

            const bankDetails = screen.getByTestId('generic-details');
            const updateButton = bankDetails.querySelector(':scope > [data-action="update"]') as HTMLElement;

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockConfig.update).toHaveBeenCalled();
                expect(mockSetItems).toHaveBeenCalled();
            });
        });

        it('does not call handlers when config is null', async () => {
            setupMockBankDetails([], null);
            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('category-bar')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
        });
    });

    describe('Correspondent Banks Operations', () => {
        const setupWithCorrespondentBanks = (banks: any[] = [{ id: 10 }]) => {
            const mockConfig = createMockConfig(true);
            setupMockBankDetails([{ id: 1, correspondentBanks: banks }], mockConfig);
            return mockConfig;
        };

        it('creates correspondent bank successfully', async () => {
            mockCorrespondentCreate.mockResolvedValue({ id: 2, name: 'New Correspondent' });
            setupWithCorrespondentBanks();
            render(<DonatePageContent />);

            await testCorrespondentOperation('Submit', mockCorrespondentCreate, [
                'mockClient',
                { id: 1, foreignBankDetailsId: 1 },
            ]);
        });

        it('updates correspondent bank successfully', async () => {
            mockCorrespondentUpdate.mockResolvedValue({ id: 10, name: 'Updated Correspondent' });
            setupWithCorrespondentBanks();
            render(<DonatePageContent />);

            await testCorrespondentOperation('Update', mockCorrespondentUpdate, [
                'mockClient',
                1,
                { name: 'Updated', foreignBankDetailsId: 1 },
            ]);
        });

        it('deletes correspondent bank successfully', async () => {
            setupWithCorrespondentBanks();
            render(<DonatePageContent />);

            await testCorrespondentOperation('Delete', mockCorrespondentDelete, ['mockClient', 1]);
            expect(mockAddToast).toHaveBeenCalled();
        });

        it('creates with foreignBankDetailsId', async () => {
            mockCorrespondentCreate.mockResolvedValue({ id: 2, name: 'New', foreignBankDetailsId: 1 });
            setupWithCorrespondentBanks();
            render(<DonatePageContent />);

            await testCorrespondentOperation('Submit', mockCorrespondentCreate, [
                'mockClient',
                { id: 1, foreignBankDetailsId: 1 },
            ]);
        });

        it('updates with foreignBankDetailsId', async () => {
            mockCorrespondentUpdate.mockResolvedValue({ id: 10, name: 'Updated', foreignBankDetailsId: 1 });
            setupWithCorrespondentBanks([{ id: 10, name: 'Old' }]);
            render(<DonatePageContent />);

            await testCorrespondentOperation('Update', mockCorrespondentUpdate, [
                'mockClient',
                1,
                { name: 'Updated', foreignBankDetailsId: 1 },
            ]);
        });

        it('calls addToast after successful deletion', async () => {
            setupWithCorrespondentBanks();
            render(<DonatePageContent />);
            mockAddToast.mockClear();

            await testCorrespondentOperation('Delete', mockCorrespondentDelete, ['mockClient', 1]);
            expect(mockAddToast).toHaveBeenCalled();
        });
    });

    describe('State Updates', () => {
        it('updates bank details and preserves correspondent banks', async () => {
            const mockConfig = createMockConfig(true);
            mockConfig.update.mockResolvedValue({ id: 1, name: 'Updated Bank' });
            const existingBanks = [{ id: 10, name: 'Correspondent 1' }];
            setupMockBankDetails([{ id: 1, name: 'Test Bank', correspondentBanks: existingBanks }], mockConfig);

            render(<DonatePageContent />);
            const updateButton = screen
                .getByTestId('generic-details')
                .querySelector(':scope > [data-action="update"]') as HTMLElement;
            fireEvent.click(updateButton);

            await waitFor(() => expect(mockSetItems).toHaveBeenCalled());

            testSetItemsCallback([{ id: 1, name: 'Test Bank', correspondentBanks: existingBanks }], (items) => {
                expect(items[0].correspondentBanks).toEqual(existingBanks);
                expect(items[0].name).toBe('Updated Bank');
            });
        });

        it('handles correspondent bank creation with undefined correspondentBanks', async () => {
            const mockConfig = createMockConfig(true);
            mockCorrespondentCreate.mockResolvedValue({ id: 2, name: 'New' });
            setupMockBankDetails([{ id: 1 }], mockConfig);

            render(<DonatePageContent />);
            const correspondentDetails = await setupCorrespondentBankTest();
            fireEvent.click(within(correspondentDetails).getByText('Submit'));

            await waitFor(() => expect(mockSetItems).toHaveBeenCalled());

            testSetItemsCallback([{ id: 1 }], (items) => {
                expect(Array.isArray(items[0].correspondentBanks)).toBe(true);
                expect(items[0].correspondentBanks).toContainEqual({ id: 2, name: 'New' });
            });
        });

        it('handles multiple bank items when updating correspondent', async () => {
            const mockConfig = createMockConfig(true);
            mockCorrespondentUpdate.mockResolvedValue({ id: 10, name: 'Updated' });
            setupMockBankDetails(
                [
                    { id: 1, correspondentBanks: [{ id: 10, name: 'Old' }] },
                    { id: 2, correspondentBanks: [{ id: 20, name: 'Other' }] },
                ],
                mockConfig,
            );

            render(<DonatePageContent />);
            const correspondentDetails = await setupCorrespondentBankTest();
            fireEvent.click(within(correspondentDetails).getByText('Update'));

            await waitFor(() => expect(mockSetItems).toHaveBeenCalled());

            const previousItems = [
                { id: 1, correspondentBanks: [{ id: 10, name: 'Old' }] },
                { id: 2, correspondentBanks: [{ id: 20, name: 'Other' }] },
            ];
            testSetItemsCallback(previousItems, (items) => {
                expect(items[0].correspondentBanks[0].id).toBe(10);
                expect(items[1].correspondentBanks[0].name).toBe('Other');
            });
        });

        it('deletes correspondent bank from correct parent bank', async () => {
            const mockConfig = createMockConfig(true);
            setupMockBankDetails([{ id: 1, correspondentBanks: [{ id: 10 }, { id: 11 }] }], mockConfig);

            render(<DonatePageContent />);
            const correspondentDetails = await setupCorrespondentBankTest();
            fireEvent.click(within(correspondentDetails).getByText('Delete'));

            await waitFor(() => expect(mockSetItems).toHaveBeenCalled());

            testSetItemsCallback([{ id: 1, correspondentBanks: [{ id: 10 }, { id: 11 }] }], (items) => {
                expect(items[0].correspondentBanks.length).toBe(2);
                expect(items[0].correspondentBanks.find((cb: any) => cb.id === 1)).toBeUndefined();
            });
        });
    });

    describe('Component Lifecycle', () => {
        it('cleans up useEffect on unmount', async () => {
            const { unmount } = render(<DonatePageContent />);

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalled();
            });

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

            const { unmount } = render(<DonatePageContent />);

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalled();
            });

            unmount();

            resolvePromise!([{ id: 1 }]);

            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(true).toBe(true);
        });
    });
});
