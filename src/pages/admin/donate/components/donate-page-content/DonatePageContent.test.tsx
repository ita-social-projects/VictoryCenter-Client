import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { DonatePageContent } from './DonatePageContent';

const mockUseBankDetails = jest.fn();
const mockUseAdminClient = jest.fn();
const mockGetAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockSetItems = jest.fn();

const mockBankCurrency = {
    Uah: 0,
    Usd: 1,
    Eur: 2,
};

jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => mockUseAdminClient(),
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
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
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
    CategoryBar: ({ onCategorySelect }: any) => (
        <div data-testid="category-bar">
            <button onClick={() => onCategorySelect('USD')}>USD</button>
        </div>
    ),
}));

jest.mock('../generic-details/GenericDetails', () => ({
    GenericDetails: ({ children, onChangeItems, onSubmit, onUpdate, onDelete }: any) => (
        <div data-testid="generic-details">
            {onChangeItems && <button onClick={() => onChangeItems([{ id: 1 }])}>Change Items</button>}
            {onSubmit && <button onClick={() => onSubmit({ id: 1 })}>Submit</button>}
            {onUpdate && <button onClick={() => onUpdate(1, { name: 'Updated' })}>Update</button>}
            {onDelete && <button onClick={() => onDelete(1)}>Delete</button>}
            {children && typeof children === 'function' && children({ formState: { id: 1 }, isItemsExpanded: false })}
        </div>
    ),
}));

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
        createEmptyItem: jest.fn(),
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

    const renderAndWait = async (component: React.ReactElement) => {
        render(component);
        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
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
    });

    it('renders component successfully', async () => {
        await renderAndWait(<DonatePageContent />);
        expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        expect(screen.getByTestId('support-options-form')).toBeInTheDocument();
    });

    it('renders GenericDetails when config exists', async () => {
        await renderAndWait(<DonatePageContent />);
        expect(screen.getByTestId('generic-details')).toBeInTheDocument();
    });

    it('does not render GenericDetails when config is null', async () => {
        setupMockBankDetails([], null);
        await renderAndWait(<DonatePageContent />);
        expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
    });

    it('renders correspondent banks when withCorrespondentBanks is true', async () => {
        setupMockBankDetails([{ id: 1, correspondentBanks: [] }], createMockConfig(true));
        await renderAndWait(<DonatePageContent />);
        expect(screen.getAllByTestId('generic-details')).toHaveLength(2);
    });

    it('does not render correspondent banks when withCorrespondentBanks is false', async () => {
        setupMockBankDetails([{ id: 1 }], createMockConfig(false));
        await renderAndWait(<DonatePageContent />);
        expect(screen.getAllByTestId('generic-details')).toHaveLength(1);
    });

    it('fetches support options on mount', async () => {
        await renderAndWait(<DonatePageContent />);
        expect(mockGetAll).toHaveBeenCalledWith('mockClient', 0);
    });

    it('handles category change', async () => {
        render(<DonatePageContent />);
        fireEvent.click(screen.getByText('USD'));
        await waitFor(() => {
            expect(mockGetAll).toHaveBeenCalledWith('mockClient', 1);
        });
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
        await renderAndWait(<DonatePageContent />);
        expect(mockGetAll).toHaveBeenCalled();
    });

    it('handles correspondent banks with onSubmit prop', async () => {
        setupMockBankDetails([{ id: 1, correspondentBanks: [] }], createMockConfig(true));
        await renderAndWait(<DonatePageContent />);

        const genericDetails = screen.getAllByTestId('generic-details');
        expect(genericDetails).toHaveLength(2);
    });
});
