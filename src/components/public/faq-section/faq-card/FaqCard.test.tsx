import { render, screen, fireEvent } from '@testing-library/react';
import { FaqCard } from './FaqCard';
import { FaqQuestion } from '../../../../types/public/faq';

describe('test question card component', () => {
    const mockQuestion: FaqQuestion = {
        id: 1,
        question: 'Як долучитись до програми?',
        answer:
            'Потрібно заповнити коротку анкету або написати координатору через форму на сайті.' +
            " Після цього ми зв'яжемось для уточнення деталей.",
    };
    test('should contain correct information', () => {
        render(<FaqCard faq={mockQuestion} />);
        const question = screen.getByText(mockQuestion.question);
        expect(question).toBeInTheDocument();

        const answer = screen.getByText(mockQuestion.answer);
        expect(answer).toBeInTheDocument();

        const openIcon = document.querySelector('.faq-open');
        expect(openIcon).toBeInTheDocument();

        const closeIcon = document.querySelector('.faq-close');
        expect(closeIcon).toBeInTheDocument();
    });
    test('should have correct classes', () => {
        const { container } = render(<FaqCard faq={mockQuestion} />);
        expect(container.querySelector('.faq-question')).toBeInTheDocument();
        expect(container.querySelector('.button-icons')).toBeInTheDocument();
        expect(container.querySelector('.faq-open')).toBeInTheDocument();
        expect(container.querySelector('.faq-close')).toBeInTheDocument();
        expect(container.querySelector('.faq-answer')).toBeInTheDocument();
    });
    test('should change icons on mouse enter and revert on mouse leave', () => {
        render(<FaqCard faq={mockQuestion} />);
        const detailsElement = screen.getByText(mockQuestion.question).closest('details');
        expect(detailsElement).toBeInTheDocument();

        const openIcon = document.querySelector('.faq-open') as HTMLImageElement;
        const closeIcon = document.querySelector('.faq-close') as HTMLImageElement;

        expect(openIcon.src).toContain('arrowDown.svg');
        expect(closeIcon.src).toContain('Cross.svg');

        fireEvent.mouseEnter(detailsElement!);

        expect(openIcon.src).toContain('arrowDownBlue.svg');
        expect(closeIcon.src).toContain('crossBlue.svg');

        fireEvent.mouseLeave(detailsElement!);

        expect(openIcon.src).toContain('arrowDown.svg');
        expect(closeIcon.src).toContain('Cross.svg');
    });
});
