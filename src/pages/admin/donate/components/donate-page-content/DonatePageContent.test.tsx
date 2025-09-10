// DonatePageContent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DonatePageContent } from './DonatePageContent';

// 🔹 Мокуємо залежності
jest.mock('../bank-details-currencies/CurrenciesManager', () => ({
    Currencies: {
        UAH: 'UAH',
        USD: 'USD',
        EUR: 'EUR',
    },
    useBankDetails: jest.fn(),
}));

jest.mock('../../../../../components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ categories, selectedCategory, onCategorySelect, getCategoryDisplayName }: any) => (
        <div>
            {categories.map((c: any) => (
                <button
                    key={c}
                    data-testid={`category-${c}`}
                    onClick={() => onCategorySelect(c)}
                    style={{ fontWeight: selectedCategory === c ? 'bold' : 'normal' }}
                >
                    {getCategoryDisplayName(c)}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('../generic-details/GenericDetails', () => ({
    GenericDetails: ({ children, items }: any) => (
        <div data-testid="generic-details">
            GenericDetails ({items.length}){children && children({ formState: {}, isItemsExpanded: false })}
        </div>
    ),
}));

jest.mock('../support-options/support-options-form/SupportOptionsForm', () => ({
    SupportOptionsForm: ({ initialData, onChangeItems }: any) => (
        <div>
            <p data-testid="support-options">{initialData.length} options</p>
            <button onClick={() => onChangeItems([{ id: 1, name: 'Test', value: '123' }])}>Add option</button>
        </div>
    ),
}));

const mockUseBankDetails = require('../bank-details-currencies/CurrenciesManager').useBankDetails;

describe('DonatePageContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseBankDetails.mockReturnValue({
            items: [],
            config: {
                form: jest.fn(),
                createEmptyItem: jest.fn(),
                withCorrespondentBanks: false,
            },
            setItems: jest.fn(),
        });
    });

    it('render all currency categories', () => {
        render(<DonatePageContent />);
        expect(screen.getByTestId('category-UAH')).toBeInTheDocument();
        expect(screen.getByTestId('category-USD')).toBeInTheDocument();
        expect(screen.getByTestId('category-EUR')).toBeInTheDocument();
    });

    it('UAH category is selected by default', () => {
        render(<DonatePageContent />);
        const btn = screen.getByTestId('category-UAH');
        expect(btn).toHaveStyle('font-weight: bold');
    });

    it('change category on click', () => {
        render(<DonatePageContent />);
        fireEvent.click(screen.getByTestId('category-USD'));
        expect(screen.getByTestId('category-USD')).toHaveStyle('font-weight: bold');
    });

    it('render GenericDetails if config exists', () => {
        render(<DonatePageContent />);
        expect(screen.getByTestId('generic-details')).toBeInTheDocument();
    });

    it('update SupportOptions on add', () => {
        render(<DonatePageContent />);
        expect(screen.getByTestId('support-options')).toHaveTextContent('0 options');
        fireEvent.click(screen.getByText('Add option'));
        expect(screen.getByTestId('support-options')).toHaveTextContent('1 options');
    });
});
