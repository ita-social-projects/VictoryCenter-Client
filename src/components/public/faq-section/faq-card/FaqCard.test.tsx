import { render, screen } from '@testing-library/react';
import { FaqCard } from './FaqCard';
import { PublishedFaqQuestion } from '../../../../types/public/faq-section';

// Mock SVG imports as React components
jest.mock('../../../../assets/icons/cross.svg', () => ({
    ReactComponent: () => <div className="faq-close" data-testid="close-icon" />,
}));
jest.mock('../../../../assets/icons/arrow-down-right.svg', () => ({
    ReactComponent: () => <div className="faq-open" data-testid="open-icon" />,
}));

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

        const openIcon = screen.getByTestId('open-icon');
        expect(openIcon).toBeInTheDocument();

        const closeIcon = screen.getByTestId('close-icon');
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
});
