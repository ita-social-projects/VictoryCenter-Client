import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventsPageAdmin } from './EventsPageAdmin';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { AdminPanelToolbarProps } from '@/components/admin/admin-panel-toolbar/AdminPageToolbar';
import { EVENTS_TEXT } from '@/const/admin/events';

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: () => ({
        allLanguages: [{ id: 1, code: 'uk', name: 'Українська' }],
        onLanguageChange: jest.fn(),
        onTranslationStatusFilterChange: jest.fn(),
    }),
}));

jest.mock('@/services/api/admin/events/events-api', () => ({
    EventsApi: {
        fetchEventSearchItems: jest.fn(),
        fetchEvents: jest.fn(),
    },
}));

jest.mock('@/components/admin/admin-panel-toolbar/AdminPageToolbar', () => ({
    AdminPanelToolbar: ({ placeholder, AddItemButtonText }: AdminPanelToolbarProps<any>) => (
        <div data-testid="events-toolbar">
            <span>{placeholder}</span>
            <span>{AddItemButtonText}</span>
        </div>
    ),
}));

const mockedUseAdminClient = useAdminClient as jest.Mock;

describe('EventsPageAdmin', () => {
    beforeEach(() => {
        mockedUseAdminClient.mockReturnValue({});
    });

    it('renders the toolbar with the events placeholder and add-item text', () => {
        render(<EventsPageAdmin />);

        expect(screen.getByTestId('events-page-content')).toBeInTheDocument();
        expect(screen.getByTestId('events-toolbar')).toBeInTheDocument();
        expect(screen.getByText(EVENTS_TEXT.PLACEHOLDER.SEARCH_EVENTS)).toBeInTheDocument();
        expect(screen.getByText(EVENTS_TEXT.BUTTON.ADD_EVENT)).toBeInTheDocument();
    });

    it('does not render an error message when there is no error', () => {
        const { container } = render(<EventsPageAdmin />);

        expect(container.querySelector('.error-message')).not.toBeInTheDocument();
    });
});
