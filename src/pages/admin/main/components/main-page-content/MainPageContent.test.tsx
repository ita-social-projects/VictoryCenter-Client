import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MainPageContent } from './MainPageContent';
import { MAIN_PAGE_TEXT } from '@/const/admin/main-page';

jest.mock('../title-block/TitleBlockForm', () => ({
    __esModule: true,
    TitleBlockForm: () => <div data-testid="title-block-form">Title Form</div>,
}));

jest.mock('../about-us-block/AboutUsBlockForm', () => ({
    __esModule: true,
    AboutUsBlockForm: () => <div data-testid="about-us-block-form">About Us Form</div>,
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    __esModule: true,
    CategoryBar: ({ categories, onCategorySelect, selectedCategory }: any) => (
        <div data-testid="category-bar">
            {categories.map((c: any) => (
                <button
                    key={c.id}
                    data-testid={`tab-btn-${c.id}`}
                    disabled={selectedCategory?.id === c.id}
                    onClick={() => onCategorySelect(c)}
                >
                    {c.label}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('@/components/common/page-loader/PageLoader', () => ({
    __esModule: true,
    PageLoader: () => <div data-testid="page-loader">Loading...</div>,
}));

describe('MainPageContent', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('renders loader initially while data is "fetching"', () => {
        render(<MainPageContent />);
        expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    });

    it('renders TitleBlockForm as the default tab after loading', async () => {
        render(<MainPageContent />);

        jest.advanceTimersByTime(500);

        await waitFor(() => {
            expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        expect(screen.getByTestId('title-block-form')).toBeInTheDocument();
    });

    it('switches tabs correctly', async () => {
        render(<MainPageContent />);
        jest.advanceTimersByTime(500);

        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });

        expect(screen.getByTestId('title-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('about-us-block-form')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('tab-btn-about'));

        expect(screen.getByTestId('about-us-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('title-block-form')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('tab-btn-statistics'));

        expect(screen.getByText(`Блок "${MAIN_PAGE_TEXT.TABS.STATISTICS}" в розробці`)).toBeInTheDocument();
    });
});
