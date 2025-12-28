import { render, screen } from '@testing-library/react';
import { useTranslation } from 'react-i18next';
import { DonatePageIntro } from './DonatePageIntro';

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
}));

describe('DonatePageIntro', () => {
    const mockUseTranslation = useTranslation as jest.Mock;

    const setupMockTitle = (title: string) => {
        mockUseTranslation.mockReturnValue({
            t: (key: string) => (key === 'DONATE_PAGE_TITLE' ? title : key),
        });
    };

    it('renders with line breaks if PAGE_TITLE contains |', () => {
        setupMockTitle('Part1 | Part2');

        render(<DonatePageIntro />);

        const heading = screen.getByRole('heading');
        expect(heading.innerHTML).toContain('<br');
    });

    it('renders without line breaks if PAGE_TITLE does not contain |', () => {
        setupMockTitle('SingleTitle');

        render(<DonatePageIntro />);

        const heading = screen.getByRole('heading');
        expect(heading).toHaveTextContent('SingleTitle');
        expect(heading.innerHTML).not.toContain('<br');
    });
});
