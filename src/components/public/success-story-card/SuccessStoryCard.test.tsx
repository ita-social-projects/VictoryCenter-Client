import { fireEvent, render, screen } from '@testing-library/react';
import { SuccessStoryCard } from './SuccessStoryCard';
import { StoriesOfVictoryReviewArticle } from '@/types/public/stories-of-victory';
import { TranslationStatus } from '@/types/common/language';

let mockCurrentLanguage = 'uk';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage }),
}));

jest.mock('@/assets/icons/square-arrow-out-up-right.svg', () => ({
    ReactComponent: () => <svg data-testid="external-link-icon" />,
}));

const article: StoriesOfVictoryReviewArticle = {
    id: 1,
    title: 'Story title',
    story: 'Story text',
    image: 'story-image.jpg',
};

const createEnglishLocalizedArticle = (): StoriesOfVictoryReviewArticle => ({
    ...article,
    localizations: [
        {
            language: { id: 2, code: 'en' },
            translationStatus: TranslationStatus.Relevant,
            title: 'English title',
            story: 'English story',
        },
    ],
});

const longStory = 'A'.repeat(150);
const collapsedStory = `"${'A'.repeat(100)}..."`;

const expectDefaultArticleContent = (localizedArticle: StoriesOfVictoryReviewArticle) => {
    render(<SuccessStoryCard article={localizedArticle} />);

    expect(screen.getByRole('img', { name: 'Story title' })).toBeInTheDocument();
    expect(screen.getByText('"Story text"')).toBeInTheDocument();
};

describe('SuccessStoryCard', () => {
    beforeEach(() => {
        mockCurrentLanguage = 'uk';
    });

    it('renders the image, truncated story, and read button with its icon', () => {
        render(<SuccessStoryCard article={{ ...article, story: longStory }} />);

        expect(screen.getByRole('img', { name: 'Story title' })).toHaveAttribute('src', 'story-image.jpg');
        expect(screen.getByText(collapsedStory)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'ARTICLES.READ_STORY' })).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByTestId('external-link-icon')).toBeInTheDocument();
    });

    it('expands on hover over the image and story area, then collapses on mouse leave', () => {
        render(<SuccessStoryCard article={{ ...article, story: longStory }} />);
        const storyContent = screen.getByTestId('story-content-1');

        fireEvent.mouseEnter(storyContent);
        expect(screen.getByText(`"${longStory}"`)).toBeInTheDocument();
        expect(screen.getByText(collapsedStory)).toHaveAttribute('aria-hidden', 'true');

        fireEvent.mouseLeave(storyContent);
        expect(screen.getByText(collapsedStory)).toBeInTheDocument();
        expect(screen.queryByText(`"${longStory}"`)).not.toBeInTheDocument();
    });

    it('does not expand on button hover, but toggles when the button is clicked', () => {
        render(<SuccessStoryCard article={{ ...article, story: longStory }} />);
        const button = screen.getByRole('button', { name: 'ARTICLES.READ_STORY' });

        fireEvent.mouseEnter(button);
        expect(screen.getByText(collapsedStory)).toBeInTheDocument();
        expect(screen.queryByText(`"${longStory}"`)).not.toBeInTheDocument();

        fireEvent.click(button);
        expect(screen.getByText(`"${longStory}"`)).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-expanded', 'true');

        fireEvent.click(button);
        expect(screen.getByText(collapsedStory)).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('collapses after clicking outside the card', () => {
        render(<SuccessStoryCard article={{ ...article, story: longStory }} />);
        fireEvent.click(screen.getByRole('button', { name: 'ARTICLES.READ_STORY' }));

        fireEvent.pointerDown(document.body);
        expect(screen.getByText(collapsedStory)).toBeInTheDocument();
        expect(screen.queryByText(`"${longStory}"`)).not.toBeInTheDocument();
    });

    it('collapses on page scroll and keeps expanded text in a scrollable area', () => {
        render(<SuccessStoryCard article={{ ...article, story: longStory }} />);
        fireEvent.click(screen.getByRole('button', { name: 'ARTICLES.READ_STORY' }));

        expect(screen.getByText(`"${longStory}"`).parentElement).toHaveClass('expandedText');
        fireEvent.scroll(window);
        expect(screen.getByText(collapsedStory)).toBeInTheDocument();
        expect(screen.queryByText(`"${longStory}"`)).not.toBeInTheDocument();
    });

    it('uses the active language localization for title and story', () => {
        mockCurrentLanguage = 'en';
        render(<SuccessStoryCard article={createEnglishLocalizedArticle()} />);

        expect(screen.getByRole('img', { name: 'English title' })).toBeInTheDocument();
        expect(screen.getByText('"English story"')).toBeInTheDocument();
    });

    it('uses the default language content when no matching translation exists', () => {
        mockCurrentLanguage = 'en';
        expectDefaultArticleContent(article);
    });

    it('uses the default language content on the Ukrainian site when a translation exists', () => {
        expectDefaultArticleContent(createEnglishLocalizedArticle());
    });

    it('does not render a read button when the story has no image', () => {
        render(<SuccessStoryCard article={{ ...article, image: null }} />);
        expect(screen.queryByRole('button', { name: 'ARTICLES.READ_STORY' })).not.toBeInTheDocument();
    });
});
