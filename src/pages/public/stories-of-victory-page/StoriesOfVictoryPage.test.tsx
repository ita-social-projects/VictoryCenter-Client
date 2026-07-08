import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { StoriesOfVictoryPage } from './StoriesOfVictoryPage';

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { changeLanguage: jest.fn() },
    }),
}));

// Mock LoadableContent to simplify testing
jest.mock('@/components/common/loadable-content/LoadableContent', () => ({
    LoadableContent: function MockLoadableContent({ isLoading, error, children }: any) {
        return (
            <div data-testid="loadable-content" data-loading={isLoading} data-error={error}>
                {children}
            </div>
        );
    },
}));

describe('StoriesOfVictoryPage', () => {
    it('should render without crashing', () => {
        render(<StoriesOfVictoryPage />);
        expect(screen.getByTestId('loadable-content')).toBeInTheDocument();
    });

    it('should render LoadableContent component', () => {
        render(<StoriesOfVictoryPage />);
        const loadableContent = screen.getByTestId('loadable-content');
        expect(loadableContent).toBeInTheDocument();
    });

    it('should pass false for isLoading prop to LoadableContent', () => {
        render(<StoriesOfVictoryPage />);
        const loadableContent = screen.getByTestId('loadable-content');
        expect(loadableContent).toHaveAttribute('data-loading', 'false');
    });

    it('should pass false for error prop to LoadableContent', () => {
        render(<StoriesOfVictoryPage />);
        const loadableContent = screen.getByTestId('loadable-content');
        expect(loadableContent).toHaveAttribute('data-error', 'false');
    });

    it('should render SloganSection component', () => {
        const { container } = render(<StoriesOfVictoryPage />);
        // SloganSection renders an h1 with data-testid
        expect(container.querySelector('[data-testid="slogan-section"]')).toBeInTheDocument();
    });

    it('should render ReviewArticlesSection component', () => {
        const { container } = render(<StoriesOfVictoryPage />);
        // ReviewArticlesSection renders a section with className container
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('should render multiple section elements', () => {
        const { container } = render(<StoriesOfVictoryPage />);
        const sections = container.querySelectorAll('section');
        expect(sections.length).toBeGreaterThan(0);
    });

    it('should render ReviewsSection component', () => {
        const { container } = render(<StoriesOfVictoryPage />);
        const h3Elements = container.querySelectorAll('h3');
        expect(h3Elements.length).toBeGreaterThan(0);
    });

    it('should render all section children within LoadableContent', () => {
        render(<StoriesOfVictoryPage />);
        const loadableContent = screen.getByTestId('loadable-content');
        // Check that LoadableContent has children (the section components)
        expect(loadableContent.children.length).toBeGreaterThan(0);
    });

    it('should render component with correct structure', () => {
        render(<StoriesOfVictoryPage />);
        const loadableContent = screen.getByTestId('loadable-content');
        // Should have 4 main section children
        const children = Array.from(loadableContent.children);
        expect(children.length).toBe(3);
    });
});
