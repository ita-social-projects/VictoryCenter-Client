import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcherButtons } from './LanguageSwitcherButtons';

const renderComponent = (currentLanguage: 'uk' | 'en' = 'uk', onLanguageChange = jest.fn()) =>
    render(<LanguageSwitcherButtons currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />);

describe('LanguageSwitcherButtons', () => {
    it('should render both language buttons', () => {
        renderComponent();

        expect(screen.getByText('UA')).toBeInTheDocument();
        expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('should have "uk" (UA) active by default', () => {
        renderComponent('uk');

        expect(screen.getByRole('button', { name: 'UA' })).toHaveClass('active');
        expect(screen.getByRole('button', { name: 'EN' })).not.toHaveClass('active');
    });

    it('should call onLanguageChange when a different language is clicked', () => {
        const onLanguageChange = jest.fn();
        renderComponent('uk', onLanguageChange);

        fireEvent.click(screen.getByRole('button', { name: 'EN' }));

        expect(onLanguageChange).toHaveBeenCalledWith('en');
    });

    it('should apply custom className from props', () => {
        const { container } = render(
            <LanguageSwitcherButtons currentLanguage="uk" onLanguageChange={jest.fn()} className="test-custom-class" />,
        );

        expect(container.firstChild).toHaveClass('test-custom-class');
    });

    it('should maintain active state when clicking the already active language', () => {
        const onLanguageChange = jest.fn();
        renderComponent('uk', onLanguageChange);

        fireEvent.click(screen.getByRole('button', { name: 'UA' }));

        expect(onLanguageChange).toHaveBeenCalledWith('uk');
        expect(screen.getByRole('button', { name: 'UA' })).toHaveClass('active');
    });
});
