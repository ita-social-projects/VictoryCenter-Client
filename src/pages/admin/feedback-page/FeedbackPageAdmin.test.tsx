import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedbackPageAdmin } from './FeedbackPageAdmin';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';

beforeAll(() => {
    class MockResizeObserver {
        observe = jest.fn();
        unobserve = jest.fn();
        disconnect = jest.fn();
    }
    global.ResizeObserver = MockResizeObserver as any;
    window.ResizeObserver = MockResizeObserver as any;
});

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(() => ({})),
}));

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: () => ({
        allLanguages: [{ id: 1, code: 'uk', name: 'Українська' }],
        onLanguageChange: jest.fn(),
        onTranslationStatusFilterChange: jest.fn(),
    }),
}));

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => ({
    AdminPanelToolbar: ({ placeholder, AddItemButtonText }: any) => (
        <div data-testid="feedback-toolbar">
            <span>{placeholder}</span>
            <span>{AddItemButtonText}</span>
        </div>
    ),
}));

describe('FeedbackPageAdmin', () => {
    it('should render page content with toolbar, categories and list container', async () => {
        render(<FeedbackPageAdmin />);

        expect(screen.getByTestId('feedback-page-content')).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.BUTTON.ADD_MATERIAL)).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.TABS.HISTORY)).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.TABS.REVIEWS)).toBeInTheDocument();
        expect(screen.getByText(FEEDBACK_TEXT.TABS.VIDEOS)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Історія 1')).toBeInTheDocument();
        });
    });
});
