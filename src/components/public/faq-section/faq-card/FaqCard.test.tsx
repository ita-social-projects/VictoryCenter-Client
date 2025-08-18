import { render, screen, fireEvent } from '@testing-library/react';
import { FaqCard } from './FaqCard';
import { PublishedFaqQuestion } from '../../../../types/public/faq-section';

describe('test question card component', () => {
    const mockQuestion: PublishedFaqQuestion = {
        id: 1,
        questionText: 'Як долучитись до програми?',
        answerText:
            'Потрібно заповнити коротку анкету або написати координатору через форму на сайті.' +
            " Після цього ми зв'яжемось для уточнення деталей.",
    };
    test('should contain correct information', () => {
        render(<FaqCard faq={mockQuestion} />);
        const question = screen.getByText(mockQuestion.questionText);
        expect(question).toBeInTheDocument();

        const answer = screen.getByText(mockQuestion.answerText);
        expect(answer).toBeInTheDocument();

        const openIcon = document.querySelector('.faq-open');
        expect(openIcon).toBeInTheDocument();

        const closeIcon = document.querySelector('.faq-close');
        expect(closeIcon).toBeInTheDocument();
    });
    test('should have correct classes', () => {
        const { container } = render(<FaqCard faq={mockQuestion} />);
        expect(container.querySelector('.question-block')).toBeInTheDocument();
        expect(container.querySelector('.button-icons')).toBeInTheDocument();
        expect(container.querySelector('.faq-open')).toBeInTheDocument();
        expect(container.querySelector('.faq-close')).toBeInTheDocument();
        expect(container.querySelector('.answer-block')).toBeInTheDocument();
    });
    test('should change icons on mouse enter and revert on mouse leave', () => {
        render(<FaqCard faq={mockQuestion} />);
        const detailsElement = screen.getByText(mockQuestion.questionText).closest('details');
        expect(detailsElement).toBeInTheDocument();

        const openIcon = document.querySelector('.faq-open') as HTMLImageElement;
        const closeIcon = document.querySelector('.faq-close') as HTMLImageElement;

        expect(openIcon.src).toContain('arrow-down-right.svg');
        expect(closeIcon.src).toContain('cross.svg');

        fireEvent.mouseEnter(detailsElement!);

        expect(openIcon.src).toContain('arrow-down-right-blue.svg');
        expect(closeIcon.src).toContain('cross-blue.svg');

        fireEvent.mouseLeave(detailsElement!);

        expect(openIcon.src).toContain('arrow-down-right.svg');
        expect(closeIcon.src).toContain('cross.svg');
    });
});
