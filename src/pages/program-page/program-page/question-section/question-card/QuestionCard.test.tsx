import {render, screen, fireEvent} from '@testing-library/react';
import {QuestionCard} from "./QuestionCard";

describe('test question card component', () => {
    const mockQuestion = {
        question: "Як долучитись до програми?",
        answer: "Потрібно заповнити коротку анкету або написати координатору через форму на сайті." +
            " Після цього ми зв'яжемось для уточнення деталей."
    }
    test('should contain correct information', () => {
        render(<QuestionCard questionCard={mockQuestion}/>);
        const question = screen.getByText(mockQuestion.question);
        expect(question).toBeInTheDocument();

        const answer = screen.getByText(mockQuestion.answer);
        expect(answer).toBeInTheDocument();
        
        const openIcon = screen.getByAltText('open-arrow');
        expect(openIcon).toBeInTheDocument();
        expect(openIcon).toHaveClass('faq-open');
        
        const closeIcon = screen.getByAltText('close-cross');
        expect(closeIcon).toBeInTheDocument();
        expect(closeIcon).toHaveClass('faq-close');
    })
    test('should have correct classes', () => {
        const {container} = render(<QuestionCard questionCard={mockQuestion}/>)
        expect(container.querySelector('.faq-question')).toBeInTheDocument();
        expect(container.querySelector('.button-icons')).toBeInTheDocument();
        expect(container.querySelector('.faq-open')).toBeInTheDocument();
        expect(container.querySelector('.faq-close')).toBeInTheDocument();
        expect(container.querySelector('.faq-answer')).toBeInTheDocument();
    })
    test('should change icons on mouse enter and revert on mouse leave', () => {
        render(<QuestionCard questionCard={mockQuestion}/>);

        const detailsElement = screen.getByText(mockQuestion.question).closest('details');
        expect(detailsElement).toBeInTheDocument();

        const openIcon = screen.getByAltText('open-arrow') as HTMLImageElement;
        const closeIcon = screen.getByAltText('close-cross') as HTMLImageElement;
        
        expect(openIcon.src).toContain('arrowDown.svg');
        expect(closeIcon.src).toContain('Cross.svg');
        
        fireEvent.mouseEnter(detailsElement!);
        
        expect(openIcon.src).toContain('arrowDownBlue.svg');
        expect(closeIcon.src).toContain('crossBlue.svg');
        
        fireEvent.mouseLeave(detailsElement!);
        
        expect(openIcon.src).toContain('arrowDown.svg');
        expect(closeIcon.src).toContain('Cross.svg');
    })
})