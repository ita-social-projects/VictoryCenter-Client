import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { CompanyValues } from './CompanyValues';

jest.mock('../../../../components/public/swiper/CustomSwiper', () => ({
    CustomSwiper: ({ items, renderItem }: any) => (
        <div data-testid="custom-swiper">
            {items.map((group: any, index: number) => (
                <div key={index} data-testid={`swiper-group-${index}`}>
                    {renderItem(group, index)}
                </div>
            ))}
        </div>
    ),
}));

describe('Company Values Section', () => {
    it('should contain main title', () => {
        render(<CompanyValues />);
        const title = screen.getByRole('heading', { name: 'Наші Цінності' });
        expect(title).toBeInTheDocument();
        expect(title.closest('.values-title')).toBeInTheDocument();
    });

    it('should contain value cards', () => {
        render(<CompanyValues />);
        const cards = document.querySelectorAll('.value-card');
        expect(cards.length).toEqual(3);
        expect(cards[0]).toHaveClass('value-card');
        expect(cards[1]).toHaveClass('value-card');
        expect(cards[2]).toHaveClass('value-card');

        const values = document.querySelectorAll('.value-item');
        expect(values.length).toEqual(9);
    });

    it('should contain correct text', () => {
        render(<CompanyValues />);

        expect(screen.getByRole('heading', { name: 'Емпатія' })).toBeInTheDocument();
        expect(
            screen.getByText(/Ми поділяємо почуття та емоції наших учасників\/ць,.*розумінням та повагою/i),
        ).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Розширення прав і можливостей' })).toBeInTheDocument();
        expect(
            screen.getByText(/Прагнемо не лише бути поруч із учасниками\/цями,.* особистому розвитку./i),
        ).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Єдність' })).toBeInTheDocument();
        expect(screen.getByText(/Створюємо спільноту підтримки,.*разом ми сильніші./i)).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Різноманіття' })).toBeInTheDocument();
        expect(screen.getByText(/Ми поважаємо та цінуємо унікальний досвід.*з якою взаємодіємо./i)).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Стійкість' })).toBeInTheDocument();
        expect(screen.getByText(/Віримо у силу духу людини,.*та зміцнення життєстійкості./i)).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Відповідальність' })).toBeInTheDocument();
        expect(
            screen.getByText(/Ми несемо відповідальність за наші дії.*партнерами й благодійниками./i),
        ).toBeInTheDocument();
    });

    it('should render in correct container', () => {
        const { container } = render(<CompanyValues />);
        expect(container.querySelector('.values-block')).toBeInTheDocument();
        const title = document.querySelector('.values-title')?.closest('.values-block');
        expect(title).toBeInTheDocument();
    });
    beforeEach(() => {
        Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    });

    it('should render CustomSwiper with correct number of groups', () => {
        render(<CompanyValues />);
        const groups = document.querySelectorAll('[data-testid^="swiper-group-"]');
        expect(groups.length).toBeGreaterThan(0);

        const firstGroupItems = groups[0].querySelectorAll('.value-item');
        expect(firstGroupItems.length).toBeGreaterThan(0);
    });

    it('should update chunkedValues on resize across breakpoints', () => {
        act(() => {
            window.innerWidth = 800;
        });
        render(<CompanyValues />);
        const initialGroups = document.querySelectorAll('[data-testid^="swiper-group-"]').length;

        act(() => {
            window.innerWidth = 1200;
            window.dispatchEvent(new Event('resize'));
        });

        const updatedGroups = document.querySelectorAll('[data-testid^="swiper-group-"]').length;
        expect(updatedGroups).not.toEqual(initialGroups);
    });

    it('should handle very small width', () => {
        render(<CompanyValues />);
        act(() => {
            window.innerWidth = 500;
            window.dispatchEvent(new Event('resize'));
        });

        const groups = document.querySelectorAll('[data-testid^="swiper-group-"]');
        expect(groups.length).toBeGreaterThan(0);
    });

    it('should handle edge width 768-911 correctly', () => {
        render(<CompanyValues />);
        act(() => {
            window.innerWidth = 768;
            window.dispatchEvent(new Event('resize'));
        });
        const groups = document.querySelectorAll('[data-testid^="swiper-group-"]');
        expect(groups.length).toBeGreaterThan(0);
    });

    it('should handle large width >911 correctly', () => {
        render(<CompanyValues />);
        act(() => {
            window.innerWidth = 1200;
            window.dispatchEvent(new Event('resize'));
        });
        const groups = document.querySelectorAll('[data-testid^="swiper-group-"]');
        expect(groups.length).toBeGreaterThan(0);
    });
});
