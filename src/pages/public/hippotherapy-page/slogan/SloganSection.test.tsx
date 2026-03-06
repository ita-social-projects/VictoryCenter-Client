import { render, screen } from '@testing-library/react';
import { SloganSection } from "./SloganSection";

jest.mock('react-i18next', () => {
    const globalUk = require('@/locales/uk/hippotherapy.json');

    return {
        useTranslation: () => ({
            t: (key: string) => globalUk[key] ?? key,
        }),
    };
});

describe('SloganSection', () => {
    it('should render slogan section with translated text', () => {
        render(<SloganSection />);
        const slogan = screen.getByTestId('slogan-section');
        expect(slogan).toBeInTheDocument();
        expect(slogan).toHaveTextContent('Іповенція ≠ лікування. Це —простір взаємодії');
    });
});
