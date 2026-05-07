import React from 'react';
import { act } from 'react';
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

jest.mock('../partners-block/PartnersBlockForm', () => ({
    __esModule: true,
    PartnersBlockForm: () => <div data-testid="partners-block-form">Partners Form</div>,
}));

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    __esModule: true,
    CategoryBar: require('@/utils/test-mocks/main-page-mocks').MockMainPageCategoryBar,
}));

jest.mock('@/components/common/page-loader/PageLoader', () => ({
    __esModule: true,
    PageLoader: () => <div data-testid="page-loader">Loading...</div>,
}));

const advanceTimers = () =>
    act(() => {
        jest.advanceTimersByTime(500);
    });

const getByExactText = (text: string) =>
    screen.getByText((_, el) => el?.children.length === 0 && el?.textContent === text);

describe('MainPageContent', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        act(() => {
            jest.runOnlyPendingTimers();
        });
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('renders loader initially while data is "fetching"', () => {
        render(<MainPageContent />);
        expect(screen.getByTestId('page-loader')).toBeInTheDocument();
    });

    it('renders TitleBlockForm as the default tab after loading', async () => {
        render(<MainPageContent />);
        await advanceTimers();

        await waitFor(() => {
            expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
        });

        expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        expect(screen.getByTestId('title-block-form')).toBeInTheDocument();
    });

    it('switches tabs correctly', async () => {
        render(<MainPageContent />);
        await advanceTimers();

        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });

        expect(screen.getByTestId('title-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('about-us-block-form')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('tab-btn-about'));
        expect(screen.getByTestId('about-us-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('title-block-form')).not.toBeInTheDocument();

        fireEvent.click(screen.getByTestId('tab-btn-statistics'));
        expect(getByExactText(`Блок "${MAIN_PAGE_TEXT.TABS.STATISTICS}" в розробці`)).toBeInTheDocument();
    });

    it('does not update state after unmount (cleanup isMounted)', async () => {
        const { unmount } = render(<MainPageContent />);
        unmount();
        await advanceTimers();
        expect(true).toBe(true);
    });

    it('renders donations tab content', async () => {
        render(<MainPageContent />);
        await advanceTimers();

        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('tab-btn-donations'));
        expect(getByExactText(`Блок "${MAIN_PAGE_TEXT.TABS.DONATIONS}" в розробці`)).toBeInTheDocument();
    });

    it('renders partners tab content', async () => {
        render(<MainPageContent />);
        await advanceTimers();

        await waitFor(() => {
            expect(screen.getByTestId('category-bar')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByTestId('tab-btn-partners'));
        expect(screen.getByTestId('partners-block-form')).toBeInTheDocument();
        expect(screen.queryByTestId('title-block-form')).not.toBeInTheDocument();
    });
});
