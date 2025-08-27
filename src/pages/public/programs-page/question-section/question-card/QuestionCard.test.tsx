import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionCard } from './QuestionCard';
import { Question } from '../../../../../types/public/programs-page';

describe('test question card component', () => {
    const mockQuestion: Question = {
        question: 'Як долучитись до програми?',
        answer:
            'Потрібно заповнити коротку анкету або написати координатору через форму на сайті.' +
            " Після цього ми зв'яжемось для уточнення деталей.",
    };
    test('should contain correct information', () => {
        render(<QuestionCard questionCard={mockQuestion} />);
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
        const { container } = render(<QuestionCard questionCard={mockQuestion} />);
        expect(container.querySelector('.faq-question')).toBeInTheDocument();
        expect(container.querySelector('.button-icons')).toBeInTheDocument();
        expect(container.querySelector('.faq-open')).toBeInTheDocument();
        expect(container.querySelector('.faq-close')).toBeInTheDocument();
        expect(container.querySelector('.faq-answer')).toBeInTheDocument();
    });
});
