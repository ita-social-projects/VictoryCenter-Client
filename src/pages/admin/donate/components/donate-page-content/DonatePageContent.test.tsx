import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DonatePageContent } from './DonatePageContent';
import { BankCurrency } from '../../../../../types/admin/donate';

const mockUseBankDetails = jest.fn();
const mockUseAdminClient = jest.fn();
const mockGetAll = jest.fn();
const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockSetItems = jest.fn();

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

jest.mock('../bank-details-currencies/currencies-manager/CurrenciesManager', () => ({
    Currencies: {
        UAH: 'UAH',
        USD: 'USD',
        EUR: 'EUR',
    },
    useBankDetails: () => mockUseBankDetails(),
    mapCurrencyToBankCurrency: (currency: string) => currency,
}));

jest.mock('../../../../../components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ onCategorySelect }: any) => (
        <div data-testid="category-bar">
            <button onClick={() => onCategorySelect('USD')}>USD</button>
        </div>
    ),
}));

jest.mock('../generic-details/GenericDetails', () => ({
    GenericDetails: ({ children, onChangeItems }: any) => (
        <div data-testid="generic-details">
            <button onClick={() => onChangeItems([{ id: 1 }])}>Change Items</button>
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
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAdminClient.mockReturnValue('mockClient');
        mockUseBankDetails.mockReturnValue({
            items: [],
            config: {
                form: jest.fn(),
                createEmptyItem: jest.fn(),
                withCorrespondentBanks: false,
            },
            setItems: mockSetItems,
            isLoading: false,
        });
        mockGetAll.mockResolvedValue([]);
        mockCreate.mockResolvedValue({ id: 1, name: 'Test', value: '123', currency: BankCurrency.Uah });
        mockUpdate.mockResolvedValue({ id: 1, name: 'Updated', value: '456', currency: BankCurrency.Uah });
        mockDelete.mockResolvedValue(undefined);
    });

    it('renders component successfully', async () => {
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
            expect(screen.getByTestId('support-options-form')).toBeInTheDocument();
        });
    });

    it('renders GenericDetails when config exists', async () => {
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getByTestId('generic-details')).toBeInTheDocument();
        });
    });

    it('does not render GenericDetails when config is null', async () => {
        mockUseBankDetails.mockReturnValue({
            items: [],
            config: null,
            setItems: mockSetItems,
            isLoading: false,
        });
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.queryByTestId('generic-details')).not.toBeInTheDocument();
        });
    });

    it('renders correspondent banks when withCorrespondentBanks is true', async () => {
        mockUseBankDetails.mockReturnValue({
            items: [{ id: 1, correspondentBanks: [] }],
            config: {
                form: jest.fn(),
                createEmptyItem: jest.fn(),
                withCorrespondentBanks: true,
                correspondentForm: jest.fn(),
            },
            setItems: mockSetItems,
            isLoading: false,
        });
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getAllByTestId('generic-details')).toHaveLength(2);
        });
    });

    it('does not render correspondent banks when withCorrespondentBanks is false', async () => {
        mockUseBankDetails.mockReturnValue({
            items: [{ id: 1 }],
            config: {
                form: jest.fn(),
                createEmptyItem: jest.fn(),
                withCorrespondentBanks: false,
            },
            setItems: mockSetItems,
            isLoading: false,
        });
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getAllByTestId('generic-details')).toHaveLength(1);
        });
    });

    it('fetches support options on mount', async () => {
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(mockGetAll).toHaveBeenCalledWith('mockClient', 'UAH');
        });
    });

    it('handles category change', async () => {
        render(<DonatePageContent />);
        fireEvent.click(screen.getByText('USD'));
        await waitFor(() => {
            expect(mockGetAll).toHaveBeenCalledWith('mockClient', 'USD');
        });
    });

    it('creates support option successfully', async () => {
        render(<DonatePageContent />);
        fireEvent.click(screen.getByText('Create'));
        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith('mockClient', {
                name: 'Test',
                value: '123',
                currency: 'UAH',
            });
        });
    });

    it('updates support option successfully', async () => {
        render(<DonatePageContent />);
        fireEvent.click(screen.getByText('Update'));
        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith('mockClient', 1, {
                name: 'Updated',
                value: '456',
            });
        });
    });

    it('deletes support option successfully', async () => {
        render(<DonatePageContent />);
        fireEvent.click(screen.getByText('Delete'));
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

    it('handles correspondent banks change for existing item', async () => {
        mockUseBankDetails.mockReturnValue({
            items: [{ id: 1, correspondentBanks: [] }],
            config: {
                form: jest.fn(),
                createEmptyItem: jest.fn(),
                withCorrespondentBanks: true,
                correspondentForm: jest.fn(),
            },
            setItems: mockSetItems,
            isLoading: false,
        });
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getAllByTestId('generic-details')).toHaveLength(2);
        });
        const changeButtons = screen.getAllByText('Change Items');
        fireEvent.click(changeButtons[1]);
        await waitFor(() => {
            expect(mockSetItems).toHaveBeenCalled();
        });
    });

    it('handles correspondent banks change for new item', async () => {
        mockUseBankDetails.mockReturnValue({
            items: [{ id: 999 }],
            config: {
                form: jest.fn(),
                createEmptyItem: jest.fn(),
                withCorrespondentBanks: true,
                correspondentForm: jest.fn(),
            },
            setItems: mockSetItems,
            isLoading: false,
        });
        render(<DonatePageContent />);
        await waitFor(() => {
            expect(screen.getAllByTestId('generic-details')).toHaveLength(2);
        });
        const changeButtons = screen.getAllByText('Change Items');
        fireEvent.click(changeButtons[1]);
        await waitFor(() => {
            expect(mockSetItems).toHaveBeenCalledWith(expect.any(Function));
        });
        const setItemsCallback = mockSetItems.mock.calls[0][0];
        const result = setItemsCallback([{ id: 999 }]);
        expect(result).toEqual([{ id: 999 }, { id: 1, correspondentBanks: [{ id: 1 }] }]);
    });
});
