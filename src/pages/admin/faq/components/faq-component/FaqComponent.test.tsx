import { render, screen, fireEvent } from '@testing-library/react';
import { FaqComponent } from './FaqComponent';
import { FaqQuestion } from '@/types/admin/faq';
import { VisibilityStatus } from '@/types/admin/common';
import { FAQ_TEXT } from '@/const/admin/faq';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { LocalizationLanguage } from '@/types/common/language';

jest.mock('@/components/admin/button-tooltip/ButtonTooltip', () => ({
    ButtonTooltip: ({ children }: any) => <div data-testid="button-tooltip">{children}</div>,
}));
jest.mock('@/components/admin/visibility-status-label/VisibilityStatusLabel', () => ({
    VisibilityStatusLabel: ({ status }: any) => <span data-testid="status-label">{status}</span>,
}));
const mockDefaultLocale: LocalizationLanguage = {
    id: 1,
    code: DEFAULT_LOCALE,
    name: 'Українська',
};
const mockTranslationLocale: LocalizationLanguage[] = [
    {
        id: 2,
        code: 'en',
        name: 'English',
    },
];
const mockFaq: FaqQuestion = {
    id: 1,
    questionText: 'What is FAQ?',
    answerText: 'Frequently Asked Questions',
    status: VisibilityStatus.Published,
    pages: [
        {
            id: 1,
            slug: 'faq/page-1',
            title: 'Page 1',
        },
        {
            id: 2,
            slug: 'faq/page-2',
            title: 'Page 2',
        },
    ],
    localizations: [],
};

describe('FaqComponent', () => {
    it('renders question, answer, and status', () => {
        render(
            <FaqComponent
                faq={mockFaq}
                handleOnDeleteFaq={jest.fn()}
                handleOnEditFaq={jest.fn()}
                translationLanguages={mockTranslationLocale}
                language={mockDefaultLocale}
            />,
        );
        expect(screen.getByText('What is FAQ?')).toBeInTheDocument();
        expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
        // The mock returns status as a number, so check for that
        expect(screen.getByTestId('status-label')).toHaveTextContent(String(VisibilityStatus.Published));
    });

    it('shows correct tooltip for published status', () => {
        render(
            <FaqComponent
                faq={mockFaq}
                handleOnDeleteFaq={jest.fn()}
                handleOnEditFaq={jest.fn()}
                translationLanguages={mockTranslationLocale}
                language={mockDefaultLocale}
            />,
        );
        expect(screen.getByTestId('button-tooltip')).toHaveTextContent(FAQ_TEXT.TOOLTIP.PUBLISHED_IN);
        expect(screen.getByText('Page 1')).toBeInTheDocument();
        expect(screen.getByText('Page 2')).toBeInTheDocument();
    });

    it('shows correct tooltip for drafted status', () => {
        const draftFaq = { ...mockFaq, status: VisibilityStatus.Draft };
        render(
            <FaqComponent
                faq={draftFaq}
                handleOnDeleteFaq={jest.fn()}
                handleOnEditFaq={jest.fn()}
                translationLanguages={mockTranslationLocale}
                language={mockDefaultLocale}
            />,
        );
        expect(screen.getByTestId('button-tooltip')).toHaveTextContent(FAQ_TEXT.TOOLTIP.DRAFTED_IN);
    });

    it('calls handleOnEditFaq when edit button is clicked', () => {
        const handleOnEditFaq = jest.fn();
        const { container } = render(
            <FaqComponent
                faq={mockFaq}
                handleOnDeleteFaq={jest.fn()}
                handleOnEditFaq={handleOnEditFaq}
                translationLanguages={mockTranslationLocale}
                language={mockDefaultLocale}
            />,
        );
        fireEvent.click(container.querySelector('.faq-edit-btn')!);
        expect(handleOnEditFaq).toHaveBeenCalledWith(mockFaq);
    });

    it('calls handleOnDeleteFaq when delete button is clicked', () => {
        const handleOnDeleteFaq = jest.fn();
        const { container } = render(
            <FaqComponent
                faq={mockFaq}
                handleOnDeleteFaq={handleOnDeleteFaq}
                handleOnEditFaq={jest.fn()}
                translationLanguages={mockTranslationLocale}
                language={mockDefaultLocale}
            />,
        );
        fireEvent.click(container.querySelector('.faq-delete-btn')!);
        expect(handleOnDeleteFaq).toHaveBeenCalledWith(mockFaq);
    });
});
