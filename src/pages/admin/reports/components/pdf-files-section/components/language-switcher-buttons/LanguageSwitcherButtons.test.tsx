import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageSwitcherButtons } from './LanguageSwitcherButtons';

describe('LanguageSwitcherButtons', () => {
    it('should render both language buttons', () => {
        render(<LanguageSwitcherButtons />);

        expect(screen.getByText('UA')).toBeInTheDocument();
        expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('should have "uk" (UA) active by default', () => {
        render(<LanguageSwitcherButtons />);

        const uaButton = screen.getByRole('button', { name: 'UA' });
        expect(uaButton).toHaveClass('active');

        const enButton = screen.getByRole('button', { name: 'EN' });
        expect(enButton).not.toHaveClass('active');
    });

    it('should switch active class when a different language is clicked', () => {
        render(<LanguageSwitcherButtons />);

        const uaButton = screen.getByRole('button', { name: 'UA' });
        const enButton = screen.getByRole('button', { name: 'EN' });

        fireEvent.click(enButton);

        expect(enButton).toHaveClass('active');
        expect(uaButton).not.toHaveClass('active');
    });

    it('should apply custom className from props', () => {
        const customClass = 'test-custom-class';
        const { container } = render(<LanguageSwitcherButtons className={customClass} />);

        expect(container.firstChild).toHaveClass(customClass);
    });

    it('should maintain state when clicking the already active language', () => {
        render(<LanguageSwitcherButtons />);

        const uaButton = screen.getByRole('button', { name: 'UA' });

        fireEvent.click(uaButton);

        expect(uaButton).toHaveClass('active');
        expect(screen.getByRole('button', { name: 'EN' })).not.toHaveClass('active');
    });
});
