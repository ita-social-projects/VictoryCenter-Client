import { render, screen } from '@testing-library/react';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { LanguageSyncWrapper } from './LanguageSyncWrapper';
import { useLocation } from 'react-router-dom';

// Спільні мок-функції
const mockNavigateAction = jest.fn();
const mockChangeLanguage = jest.fn();

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigateAction,
    useLocation: jest.fn(),
    Outlet: () => <div data-testid="outlet-mock" />,
}));

const mockedUseLocale = useLocale as jest.Mock;
const mockedUseLocation = useLocation as jest.Mock;

describe('LanguageSyncWrapper', () => {
    const setupMocks = ({ lang = 'uk', path = '/en/program', search = '' } = {}) => {
        mockedUseLocale.mockReturnValue({
            currentLanguage: lang,
            i18n: { changeLanguage: mockChangeLanguage, language: lang },
        });
        mockedUseLocation.mockReturnValue({ pathname: path, search });
    };

    beforeEach(() => {
        jest.clearAllMocks();
        setupMocks();
    });

    test('should render outlet', () => {
        render(<LanguageSyncWrapper />);
        expect(screen.getByTestId('outlet-mock')).toBeInTheDocument();
    });

    test('should change language if URL param differs from current', () => {
        setupMocks({ lang: 'uk', path: '/en/program' });
        
        render(<LanguageSyncWrapper />);
        
        expect(mockChangeLanguage).toHaveBeenCalledWith('en');
        expect(mockNavigateAction).not.toHaveBeenCalled();
    });

    test('should do nothing if URL language matches current', () => {
        setupMocks({ lang: 'en', path: '/en/program' });
        
        render(<LanguageSyncWrapper />);
        
        expect(mockChangeLanguage).not.toHaveBeenCalled();
        expect(mockNavigateAction).not.toHaveBeenCalled();
    });

    test('should reset to default locale on root path', () => {
        setupMocks({ lang: 'en', path: '/' });
        
        render(<LanguageSyncWrapper />);
        
        expect(mockChangeLanguage).toHaveBeenCalledWith('uk');
    });
    test('should handle language change when current language is default and url not contain language prefix', () =>{
        setupMocks({ path: '/program' });
        render(<LanguageSyncWrapper />);
        expect(mockChangeLanguage).not.toHaveBeenCalled();
        expect(mockNavigateAction).not.toHaveBeenCalled();
    });

    test('should redirect and add language prefix if missing in URL', () => {
        setupMocks({ lang: 'en', path: '/program', search: '?ref=test' });
        
        render(<LanguageSyncWrapper />);
        
        expect(mockNavigateAction).toHaveBeenCalledWith('/en/program?ref=test', { replace: true });
    });
});