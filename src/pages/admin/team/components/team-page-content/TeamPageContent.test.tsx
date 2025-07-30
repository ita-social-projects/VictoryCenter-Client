import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamPageContent } from './TeamPageContent';
import { AdminContext } from '../../../../../context/admin-context-provider/AdminContextProvider';
import { TeamMembersApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi/TeamMembersApi';
import { MemberFormValues } from '../member-form/MemberForm';

// Mock the AdminContext
const mockAdminContext = {
    client: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
        head: jest.fn(),
        options: jest.fn(),
        request: jest.fn(),
        create: jest.fn(),
        defaults: {},
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
        },
        getUri: jest.fn(),
    } as any,
    isAuthenticated: true,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    refreshAccessToken: jest.fn(),
};

// Mock the TeamMembersApi
jest.mock(
    '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi/TeamMembersApi',
    () => ({
        TeamMembersApi: {
            postPublished: jest.fn(),
            postDraft: jest.fn(),
        },
    }),
);

// Mock the TeamPageToolbar component
jest.mock('../team-page-toolbar/TeamPageToolbar', () => ({
    TeamPageToolbar: ({
        onSearchQueryChange,
        onStatusFilterChange,
        autocompleteValues,
        onMemberPublish,
        onMemberSaveDraft,
        onError,
    }: any) => {
        return (
            <div data-testid="team-page-toolbar">
                <button onClick={() => onSearchQueryChange('John Doe')} data-testid="search-button">
                    Search John Doe
                </button>
                <button onClick={() => onStatusFilterChange('Опубліковано')} data-testid="filter-button">
                    Filter Published
                </button>
                <button onClick={() => onMemberPublish?.(mockMemberData)} data-testid="publish-button">
                    Publish Member
                </button>
                <button onClick={() => onMemberSaveDraft?.(mockMemberData)} data-testid="draft-button">
                    Save Draft
                </button>
                <button onClick={() => onError?.('Test error message')} data-testid="error-button">
                    Trigger Error
                </button>
                <div data-testid="autocomplete-values">{autocompleteValues.join(', ')}</div>
            </div>
        );
    },
}));

// Mock the MembersList component
jest.mock('../members-list/MembersList', () => ({
    MembersList: ({ searchByNameQuery, statusFilter, onAutocompleteValuesChange, refetchTrigger }: any) => {
        const React = require('react');

        React.useEffect(() => {
            onAutocompleteValuesChange(['John Doe', 'Jane Smith']);
        }, [onAutocompleteValuesChange]);

        React.useEffect(() => {
            if (refetchTrigger > 0) {
                // Simulate refetch effect
                onAutocompleteValuesChange(['Updated John', 'Updated Jane']);
            }
        }, [refetchTrigger, onAutocompleteValuesChange]);

        return (
            <div data-testid="members-list">
                <div data-testid="search-query">Query: {searchByNameQuery}</div>
                <div data-testid="status-filter">Status: {statusFilter}</div>
                <div data-testid="refetch-trigger">Refetch: {refetchTrigger}</div>
            </div>
        );
    },
}));

// Mock data for testing
const mockMemberData: MemberFormValues = {
    category: {
        id: 1,
        name: 'Основна команда',
        description: 'Test category',
    },
    fullName: 'John Doe',
    description: 'Test description',
    image: null,
    imageId: null,
};

const renderWithAdminContext = (ui: React.ReactElement) => {
    return render(<AdminContext.Provider value={mockAdminContext}>{ui}</AdminContext.Provider>);
};

describe('TeamPageContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (TeamMembersApi.postPublished as jest.Mock).mockResolvedValue({});
        (TeamMembersApi.postDraft as jest.Mock).mockResolvedValue({});
    });

    it('renders toolbar and members list', () => {
        renderWithAdminContext(<TeamPageContent />);

        expect(screen.getByTestId('team-page-toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('members-list')).toBeInTheDocument();
    });

    it('updates search query when toolbar triggers it', async () => {
        renderWithAdminContext(<TeamPageContent />);

        await userEvent.click(screen.getByTestId('search-button'));

        expect(screen.getByTestId('search-query')).toHaveTextContent('Query: John Doe');
    });

    it('updates status filter when toolbar triggers it', async () => {
        renderWithAdminContext(<TeamPageContent />);

        await userEvent.click(screen.getByTestId('filter-button'));

        expect(screen.getByTestId('status-filter')).toHaveTextContent('Status: Опубліковано');
    });

    it('updates autocomplete values from members list', () => {
        renderWithAdminContext(<TeamPageContent />);

        expect(screen.getByTestId('autocomplete-values')).toHaveTextContent('John Doe, Jane Smith');
    });

    it('handles member publication successfully', async () => {
        renderWithAdminContext(<TeamPageContent />);

        await userEvent.click(screen.getByTestId('publish-button'));

        await waitFor(() => {
            expect(TeamMembersApi.postPublished).toHaveBeenCalledWith(mockAdminContext.client, mockMemberData);
        });

        await waitFor(() => {
            expect(screen.getByTestId('refetch-trigger')).toHaveTextContent('Refetch: 1');
        });
    });

    it('handles draft save successfully', async () => {
        renderWithAdminContext(<TeamPageContent />);

        await userEvent.click(screen.getByTestId('draft-button'));

        await waitFor(() => {
            expect(TeamMembersApi.postDraft).toHaveBeenCalledWith(mockAdminContext.client, mockMemberData);
        });

        // Check that refetch was triggered
        expect(screen.getByTestId('refetch-trigger')).toHaveTextContent('Refetch: 1');
    });

    it('displays error message when API call fails', async () => {
        (TeamMembersApi.postPublished as jest.Mock).mockRejectedValue(new Error('API Error'));

        renderWithAdminContext(<TeamPageContent />);

        await userEvent.click(screen.getByTestId('publish-button'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Не вдалося опублікувати учасника. Спробуйте ще раз.');
        });
    });

    it('displays error message when draft save fails', async () => {
        (TeamMembersApi.postDraft as jest.Mock).mockRejectedValue(new Error('API Error'));

        renderWithAdminContext(<TeamPageContent />);

        await userEvent.click(screen.getByTestId('draft-button'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Не вдалося зберегти чернетку. Спробуйте ще раз.');
        });
    });

    it('clears error message when new API call succeeds', async () => {
        (TeamMembersApi.postPublished as jest.Mock)
            .mockRejectedValueOnce(new Error('API Error'))
            .mockResolvedValueOnce({});

        renderWithAdminContext(<TeamPageContent />);

        // First call fails
        await userEvent.click(screen.getByTestId('publish-button'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });

        // Second call succeeds
        await userEvent.click(screen.getByTestId('publish-button'));

        await waitFor(() => {
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    it('increments refetch trigger on successful operations', async () => {
        renderWithAdminContext(<TeamPageContent />);

        // Initial state
        expect(screen.getByTestId('refetch-trigger')).toHaveTextContent('Refetch: 0');

        // First operation
        await userEvent.click(screen.getByTestId('publish-button'));

        await waitFor(() => {
            expect(screen.getByTestId('refetch-trigger')).toHaveTextContent('Refetch: 1');
        });

        // Second operation
        await userEvent.click(screen.getByTestId('draft-button'));

        await waitFor(() => {
            expect(screen.getByTestId('refetch-trigger')).toHaveTextContent('Refetch: 2');
        });
    });

    it('handles error from toolbar', async () => {
        renderWithAdminContext(<TeamPageContent />);

        await userEvent.click(screen.getByTestId('error-button'));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Test error message');
        });
    });

    it('maintains state between operations', async () => {
        renderWithAdminContext(<TeamPageContent />);

        // Set search query
        await userEvent.click(screen.getByTestId('search-button'));

        // Set status filter
        await userEvent.click(screen.getByTestId('filter-button'));

        // Perform an operation
        await userEvent.click(screen.getByTestId('publish-button'));

        // Verify state is maintained
        expect(screen.getByTestId('search-query')).toHaveTextContent('Query: John Doe');
        expect(screen.getByTestId('status-filter')).toHaveTextContent('Status: Опубліковано');
        await waitFor(() => {
            expect(screen.getByTestId('refetch-trigger')).toHaveTextContent('Refetch: 1');
        });
    });

    describe('Error handling', () => {
        it('handles network errors gracefully', async () => {
            (TeamMembersApi.postPublished as jest.Mock).mockRejectedValue(new Error('Network Error'));

            renderWithAdminContext(<TeamPageContent />);

            await userEvent.click(screen.getByTestId('publish-button'));

            await waitFor(() => {
                expect(screen.getByRole('alert')).toHaveTextContent(
                    'Не вдалося опублікувати учасника. Спробуйте ще раз.',
                );
            });
        });

        it('handles server errors gracefully', async () => {
            (TeamMembersApi.postDraft as jest.Mock).mockRejectedValue(new Error('Server Error'));

            renderWithAdminContext(<TeamPageContent />);

            await userEvent.click(screen.getByTestId('draft-button'));

            await waitFor(() => {
                expect(screen.getByRole('alert')).toHaveTextContent('Не вдалося зберегти чернетку. Спробуйте ще раз.');
            });
        });
    });

    describe('State management', () => {
        it('initializes with default state', () => {
            renderWithAdminContext(<TeamPageContent />);

            expect(screen.getByTestId('search-query')).toHaveTextContent('Query:');
            expect(screen.getByTestId('status-filter')).toHaveTextContent('Status: Усі');
            expect(screen.getByTestId('refetch-trigger')).toHaveTextContent('Refetch: 0');
        });

        it('updates autocomplete values when members list changes', () => {
            renderWithAdminContext(<TeamPageContent />);

            expect(screen.getByTestId('autocomplete-values')).toHaveTextContent('John Doe, Jane Smith');
        });
    });
});
