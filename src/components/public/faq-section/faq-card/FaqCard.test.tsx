import { render, screen } from '@testing-library/react';
import { FaqCard } from './FaqCard';
import { PublishedFaqQuestion } from '../../../../types/public/faq-section';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { EntityLocalization, TranslationStatus } from '@/types/common/language';

// Mock SVG imports as React components
jest.mock('../../../../assets/icons/cross.svg', () => ({
    ReactComponent: () => <div className="faq-close" data-testid="close-icon" />,
}));
jest.mock('../../../../assets/icons/arrow-down-right.svg', () => ({
    ReactComponent: () => <div className="faq-open" data-testid="open-icon" />,
}));
jest.mock('@/hooks/common/use-get-localization/useGetLocalization', () => ({
    useGetLocalization: jest.fn(),
}));
const mockedUseGetLocalization = useGetLocalization as jest.Mock;

describe('test question card component', () => {
    beforeEach(() => {
        mockedUseGetLocalization.mockImplementation((_localizations, fallback) => {
            return fallback;
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockQuestion: PublishedFaqQuestion = {
        id: 1,
        questionText: 'Як долучитись до програми?',
        answerText:
            'Потрібно заповнити коротку анкету або написати координатору через форму на сайті.' +
            " Після цього ми зв'яжемось для уточнення деталей.",
        localizations: [],
    };
    test('should display Ukrainian content (fallback)', () => {
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

    test('should render localized question and answer when localizations are available', () => {
        mockedUseGetLocalization.mockImplementation((localizations, fallback) => {
            const enLocalization = localizations?.find((loc: EntityLocalization) => loc.language.code === 'en');
            
            if (enLocalization) {
                const { language: _language, translationStatus: _translationStatus, ...localizableFields } = enLocalization;
                return {
                    ...fallback,
                    ...localizableFields,
                };
            }
            return fallback;
        });
        
        const localizedQuestionText: string = 'How to join the program?';
        const localizedAnswerText: string =
            'You need to fill out a short questionnaire or write to ' +
            'the coordinator via the form on the website. After that, we will contact you to clarify the details.';

        const localizedQuestion: PublishedFaqQuestion = {
            ...mockQuestion,
            localizations: [
                {
                    language: { id: 1, code: 'en' },
                    questionText: localizedQuestionText,
                    answerText: localizedAnswerText,
                    translationStatus: TranslationStatus.Relevant,
                },
            ],
        };
        
        render(<FaqCard faq={localizedQuestion} />);

        expect(screen.getByText(localizedQuestionText)).toBeInTheDocument();
        expect(screen.getByText(localizedAnswerText)).toBeInTheDocument();

        expect(screen.queryByText(mockQuestion.questionText)).not.toBeInTheDocument();
        expect(screen.queryByText(mockQuestion.answerText)).not.toBeInTheDocument();
    });
});
