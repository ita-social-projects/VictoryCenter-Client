import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { CompanyValues } from './CompanyValues';

describe('Company Values Section', () => {
    it('should contain main title', () => {
        render(<CompanyValues />);
        const title = screen.getByRole('heading', { name: 'Наші Цінності' });
        expect(title).toBeInTheDocument();
        expect(title).toHaveClass('values-title');
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
});
