import { render, screen } from '@testing-library/react';
import { SloganSection } from './SloganSection';

jest.mock('react-i18next', () => {
    return {
        useTranslation: () => ({
            t: (key: string) => key,
        }),
    };
});

describe('SloganSection', () => {
    it('should render slogan section with translated text', () => {
        render(<SloganSection />);
        const slogan = screen.getByTestId('slogan-section');
        expect(slogan).toBeInTheDocument();
        expect(slogan).toHaveTextContent(
            'SLOGAN.FIRST_HIGHLIGHT SLOGAN.FIRST_TEXT SLOGAN.SECOND_TEXT SLOGAN.SECOND_HIGHLIGHT SLOGAN.THIRD_HIGHLIGHT',
        );
    });
});
