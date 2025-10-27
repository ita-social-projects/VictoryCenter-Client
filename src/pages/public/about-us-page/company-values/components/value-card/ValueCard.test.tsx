import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ValueCard } from './ValueCard';
import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';

jest.mock('../../../../../../const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        OUR_VALUES: 'Наші Цінності',
    },
}));

describe('ValueCard Component', () => {
    const mockGroup = [
        { NAME: 'Емпатія', DESCRIPTION: 'Ми розуміємо почуття інших.' },
        { NAME: 'Різноманіття', DESCRIPTION: 'Ми цінуємо унікальність кожного.' },
    ];

    it('should render the title only for the first group (groupIndex === 0)', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} />);
        const title = screen.getByRole('heading', { name: ABOUT_US_DATA.OUR_VALUES });
        expect(title).toBeInTheDocument();
        expect(title.closest('.values-title')).toBeInTheDocument();
    });

    it('should not render the title for groupIndex > 0', () => {
        render(<ValueCard group={mockGroup} groupIndex={1} />);
        const title = screen.queryByRole('heading', { name: ABOUT_US_DATA.OUR_VALUES });
        expect(title).not.toBeInTheDocument();
    });

    it('should render the correct number of value items', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} />);
        const items = screen.getAllByRole('heading', { level: 3 });
        expect(items).toHaveLength(mockGroup.length);
    });

    it('should render correct text for each value item', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} />);

        expect(screen.getByRole('heading', { name: 'Емпатія' })).toBeInTheDocument();
        expect(screen.getByText('Ми розуміємо почуття інших.')).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Різноманіття' })).toBeInTheDocument();
        expect(screen.getByText('Ми цінуємо унікальність кожного.')).toBeInTheDocument();
    });
});
