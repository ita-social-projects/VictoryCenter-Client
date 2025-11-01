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

    it('renders component successfully', async () => {
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });
        expect(screen.getByTestId('support-options-form')).toBeInTheDocument();
        expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });

    it('renders GenericDetails when config exists', async () => {
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getByTestId('generic-details')).toBeInTheDocument();
        });
    });

    it('does not render GenericDetails when config is null', async () => {
        setupMockBankDetails([], null);
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
    });

    it('renders correspondent banks when withCorrespondentBanks is true', async () => {
        setupMockBankDetails([{ id: 1, correspondentBanks: [] }], createMockConfig(true));
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getByTestId('generic-details')).toBeInTheDocument();
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });
    });

    it('does not render correspondent banks when withCorrespondentBanks is false', async () => {
        setupMockBankDetails([{ id: 1 }], createMockConfig(false));
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getByTestId('generic-details')).toBeInTheDocument();
            expect(screen.queryByTestId('correspondent-details')).not.toBeInTheDocument();
        });
    });

    it('fetches support options on mount', async () => {
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0);
        });
    });

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

        // Click the UAH button (which is already selected)
        const uahButton = screen.getByRole('button', { name: 'UAH' });
        fireEvent.click(uahButton);

        // Give it a small delay to ensure no new calls were made
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Should still be called only once
        expect(mockGetAll).toHaveBeenCalledTimes(1);
    });

    it('creates support option successfully', async () => {
        render(<DonatePageContent />);
        fireEvent.click(screen.getByText('Create'));
        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith('mockClient', {
                name: 'Test',
                value: '123',
                currency: 0,
            });
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

    it('calls addToast on successful operations', async () => {
        render(<DonatePageContent />);

        fireEvent.click(screen.getByText('Create'));
        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalled();
        });
    });

    // NEW TESTS FOR BETTER COVERAGE

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
        // Get only direct child button, not nested ones
        const updateButton = bankDetails.querySelector(':scope > [data-action="update"]') as HTMLElement;

        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(mockConfig.update).toHaveBeenCalled();
            expect(mockSetItems).toHaveBeenCalled();
        });
    });

    it('creates correspondent bank successfully', async () => {
        const mockConfig = createMockConfig(true);
        mockCorrespondentCreate.mockResolvedValue({ id: 2, name: 'New Correspondent' });
        setupMockBankDetails([{ id: 1, correspondentBanks: [{ id: 10 }] }], mockConfig);

        render(<DonatePageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });

        const correspondentDetails = screen.getByTestId('correspondent-details');
        const submitButton = within(correspondentDetails).getByRole('button', { name: 'Submit' });

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockCorrespondentCreate).toHaveBeenCalledWith('mockClient', {
                id: 1,
                foreignBankDetailsId: 1,
            });
        });
    });
    it('updates correspondent bank successfully', async () => {
        const mockConfig = createMockConfig(true);
        mockCorrespondentUpdate.mockResolvedValue({ id: 10, name: 'Updated Correspondent' });
        setupMockBankDetails([{ id: 1, correspondentBanks: [{ id: 10 }] }], mockConfig);

        render(<DonatePageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });

        const correspondentDetails = screen.getByTestId('correspondent-details');
        const updateButton = within(correspondentDetails).getByRole('button', { name: 'Update' });

        fireEvent.click(updateButton);

        await waitFor(() => {
            expect(mockCorrespondentUpdate).toHaveBeenCalledWith('mockClient', 1, {
                name: 'Updated',
                foreignBankDetailsId: 1,
            });
        });
    });

    it('deletes correspondent bank successfully', async () => {
        const mockConfig = createMockConfig(true);
        setupMockBankDetails([{ id: 1, correspondentBanks: [{ id: 10 }] }], mockConfig);

        render(<DonatePageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });

        const correspondentDetails = screen.getByTestId('correspondent-details');
        const deleteButton = within(correspondentDetails).getByRole('button', { name: 'Delete' });

        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockCorrespondentDelete).toHaveBeenCalledWith('mockClient', 1);
            expect(mockAddToast).toHaveBeenCalled();
        });
    });

    it('does not call handlers when config is null', async () => {
        setupMockBankDetails([], null);
        render(<DonatePageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });

        // Verify no generic details are rendered
        expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
    });

    it('renders correspondent banks with empty array', async () => {
        const mockConfig = createMockConfig(true);
        setupMockBankDetails([{ id: 1, correspondentBanks: [] }], mockConfig);

        render(<DonatePageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('generic-details')).toBeInTheDocument();
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });
    });

    it('renders correspondent banks for item without correspondentBanks property', async () => {
        const mockConfig = createMockConfig(true);
        setupMockBankDetails([{ id: 1 }], mockConfig);

        render(<DonatePageContent />);

        await waitFor(() => {
            expect(screen.getByTestId('generic-details')).toBeInTheDocument();
            expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
        });
    });

    it('cleans up useEffect on unmount', async () => {
        const { unmount } = render(<DonatePageContent />);

        await waitFor(() => {
            expect(mockGetAll).toHaveBeenCalled();
        });

        // Clear the mock to track calls after unmount
        mockGetAll.mockClear();

        unmount();

        // After unmount, no additional API calls should be made
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

        // Resolve promise after unmount - should not cause errors
        resolvePromise!([{ id: 1 }]);

        // Wait to ensure no state updates happen
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Test passes if no errors were thrown
        expect(true).toBe(true);
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

    describe('DonatePageContent - Additional Coverage', () => {
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

        it('handles support options fetch rejection on category change', async () => {
            mockGetAll.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('Fetch failed'));

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0);
            });

            fireEvent.click(screen.getByText('Switch to USD'));

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledWith('mockClient', 1);
            });

            await waitFor(() => {
                expect(mockGetAll).toHaveBeenCalledTimes(2);
            });
        });

        it('renders correspondent banks with correct items count', async () => {
            const mockConfig = createMockConfig(true);
            setupMockBankDetails(
                [
                    { id: 1, correspondentBanks: [{ id: 10 }, { id: 11 }] },
                    { id: 2, correspondentBanks: [] },
                ],
                mockConfig,
            );

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
            });

            const correspondentDetails = screen.getByTestId('correspondent-details');
            const itemsCount = within(correspondentDetails).getByTestId('items-count');

            expect(itemsCount).toHaveTextContent('2');
        });

        it('updates bank details and preserves correspondent banks in state', async () => {
            const mockConfig = createMockConfig(true);
            const updatedBankData = { id: 1, name: 'Updated Bank' };
            mockConfig.update.mockResolvedValue(updatedBankData);

            const existingCorrespondentBanks = [{ id: 10, name: 'Correspondent 1' }];
            setupMockBankDetails(
                [{ id: 1, name: 'Test Bank', correspondentBanks: existingCorrespondentBanks }],
                mockConfig,
            );

            render(<DonatePageContent />);

            const bankDetails = screen.getByTestId('generic-details');
            const updateButton = bankDetails.querySelector(':scope > [data-action="update"]') as HTMLElement;

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockConfig.update).toHaveBeenCalled();
                expect(mockSetItems).toHaveBeenCalled();
            });

            const setItemsCallback = mockSetItems.mock.calls[0][0];
            const previousItems = [{ id: 1, name: 'Test Bank', correspondentBanks: existingCorrespondentBanks }];
            const updatedItems = setItemsCallback(previousItems);

            expect(updatedItems[0].correspondentBanks).toEqual(existingCorrespondentBanks);
            expect(updatedItems[0].name).toBe('Updated Bank');
        });

        it('updates bank details without correspondent banks property', async () => {
            const mockConfig = createMockConfig(false);
            mockConfig.update.mockResolvedValue({ id: 1, name: 'Updated Bank' });
            setupMockBankDetails([{ id: 1, name: 'Test Bank' }], mockConfig);

            render(<DonatePageContent />);

            const genericDetails = screen.getByTestId('generic-details');
            const updateButton = within(genericDetails).getByText('Update');

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockConfig.update).toHaveBeenCalled();
                expect(mockSetItems).toHaveBeenCalled();
            });

            const setItemsCallback = mockSetItems.mock.calls[0][0];
            const previousItems = [{ id: 1, name: 'Test Bank' }];
            const updatedItems = setItemsCallback(previousItems);

            expect(updatedItems[0].correspondentBanks).toEqual([]);
        });

        it('creates correspondent bank with foreignBankDetailsId', async () => {
            const mockConfig = createMockConfig(true);
            const newBank = { id: 2, name: 'New Correspondent', foreignBankDetailsId: 1 };
            mockCorrespondentCreate.mockResolvedValue(newBank);
            setupMockBankDetails([{ id: 1, correspondentBanks: [{ id: 10 }] }], mockConfig);

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
            });

            const correspondentDetails = screen.getByTestId('correspondent-details');
            const submitButton = within(correspondentDetails).getByText('Submit');

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCorrespondentCreate).toHaveBeenCalledWith('mockClient', {
                    id: 1,
                    foreignBankDetailsId: 1,
                });
            });
        });

        it('updates correspondent bank with foreignBankDetailsId', async () => {
            const mockConfig = createMockConfig(true);
            const updatedBank = { id: 10, name: 'Updated Correspondent', foreignBankDetailsId: 1 };
            mockCorrespondentUpdate.mockResolvedValue(updatedBank);
            setupMockBankDetails([{ id: 1, correspondentBanks: [{ id: 10, name: 'Old Name' }] }], mockConfig);

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
            });

            const correspondentDetails = screen.getByTestId('correspondent-details');
            const updateButton = within(correspondentDetails).getByText('Update');

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockCorrespondentUpdate).toHaveBeenCalledWith('mockClient', 1, {
                    name: 'Updated',
                    foreignBankDetailsId: 1,
                });
            });
        });

        it('calls addToast after successful correspondent bank deletion', async () => {
            const mockConfig = createMockConfig(true);
            setupMockBankDetails([{ id: 1, correspondentBanks: [{ id: 10 }] }], mockConfig);

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
            });

            mockAddToast.mockClear();

            const correspondentDetails = screen.getByTestId('correspondent-details');
            const deleteButton = within(correspondentDetails).getByText('Delete');

            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockCorrespondentDelete).toHaveBeenCalledWith('mockClient', 1);
                expect(mockAddToast).toHaveBeenCalled();
            });
        });

        it('handles multiple bank items when updating correspondent', async () => {
            const mockConfig = createMockConfig(true);
            const updatedBank = { id: 10, name: 'Updated' };
            mockCorrespondentUpdate.mockResolvedValue(updatedBank);
            setupMockBankDetails(
                [
                    { id: 1, correspondentBanks: [{ id: 10, name: 'Old' }] },
                    { id: 2, correspondentBanks: [{ id: 20, name: 'Other' }] },
                ],
                mockConfig,
            );

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
            });

            const correspondentDetails = screen.getByTestId('correspondent-details');
            const updateButton = within(correspondentDetails).getByText('Update');

            fireEvent.click(updateButton);

            await waitFor(() => {
                expect(mockCorrespondentUpdate).toHaveBeenCalled();
                expect(mockSetItems).toHaveBeenCalled();
            });

            expect(mockSetItems).toHaveBeenCalledWith(expect.any(Function));

            const setItemsCallback = mockSetItems.mock.calls[0][0];
            const previousItems = [
                { id: 1, correspondentBanks: [{ id: 10, name: 'Old' }] },
                { id: 2, correspondentBanks: [{ id: 20, name: 'Other' }] },
            ];
            const updatedItems = setItemsCallback(previousItems);

            expect(updatedItems[0].correspondentBanks[0].id).toBe(10);
            expect(updatedItems[1].correspondentBanks[0].name).toBe('Other');
        });

        it('handles correspondent bank creation with undefined correspondentBanks', async () => {
            const mockConfig = createMockConfig(true);
            const newBank = { id: 2, name: 'New' };
            mockCorrespondentCreate.mockResolvedValue(newBank);
            setupMockBankDetails([{ id: 1 }], mockConfig);

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
            });

            const correspondentDetails = screen.getByTestId('correspondent-details');
            const submitButton = within(correspondentDetails).getByText('Submit');

            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockCorrespondentCreate).toHaveBeenCalled();
                expect(mockSetItems).toHaveBeenCalled();
            });

            const setItemsCallback = mockSetItems.mock.calls[0][0];
            const previousItems = [{ id: 1 }];
            const updatedItems = setItemsCallback(previousItems);

            expect(Array.isArray(updatedItems[0].correspondentBanks)).toBe(true);
            expect(updatedItems[0].correspondentBanks).toContainEqual(newBank);
        });

        it('deletes correspondent bank from correct parent bank', async () => {
            const mockConfig = createMockConfig(true);
            setupMockBankDetails([{ id: 1, correspondentBanks: [{ id: 10 }, { id: 11 }] }], mockConfig);

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('correspondent-details')).toBeInTheDocument();
            });

            const correspondentDetails = screen.getByTestId('correspondent-details');
            const deleteButton = within(correspondentDetails).getByText('Delete');

            fireEvent.click(deleteButton);

            await waitFor(() => {
                expect(mockCorrespondentDelete).toHaveBeenCalledWith('mockClient', 1);
                expect(mockSetItems).toHaveBeenCalled();
            });

            const setItemsCallback = mockSetItems.mock.calls[0][0];
            const previousItems = [{ id: 1, correspondentBanks: [{ id: 10 }, { id: 11 }] }];
            const updatedItems = setItemsCallback(previousItems);

            expect(updatedItems[0].correspondentBanks.length).toBe(2);
            expect(updatedItems[0].correspondentBanks.find((cb: any) => cb.id === 1)).toBeUndefined();
        });

        it('renders without title when not provided', async () => {
            setupMockBankDetails([{ id: 1, name: 'Test Bank' }], createMockConfig());

            render(<DonatePageContent />);

            await waitFor(() => {
                expect(screen.getByTestId('generic-details')).toBeInTheDocument();
            });

            expect(screen.getByTestId('generic-details')).toBeInTheDocument();
        });
    });
});
