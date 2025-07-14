import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamPageContent } from './TeamPageContent';

jest.mock('../../../../../context/admin-context-provider/AdminContextProvider', () => ({
    useAdminContext: () => ({
        client: {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        },
    }),
}));

jest.mock('../team-page-toolbar/TeamPageToolbar', () => ({
    TeamPageToolbar: ({ onSearchQueryChange, onStatusFilterChange, autocompleteValues }: any) => {
        return (
            <div data-testid="toolbar">
                <button onClick={() => onSearchQueryChange('John')}>Search John</button>
                <button onClick={() => onStatusFilterChange('Опубліковано')}>Filter Published</button>
                <div>{autocompleteValues.join(',')}</div>
            </div>
        );
    },
}));

jest.mock('../members-list/MembersList', () => {
    const React = require('react');
    return {
        MembersList: ({ searchByNameQuery, statusFilter, onAutocompleteValuesChange }: any) => {
            React.useEffect(() => {
                onAutocompleteValuesChange(['John', 'Jane']);
            }, [onAutocompleteValuesChange]);

            return (
                <div data-testid="members-list">
                    <div>Query: {searchByNameQuery}</div>
                    <div>Status: {statusFilter}</div>
                </div>
            );
        },
    };
});

describe('TeamPageContent', () => {
    it('renders toolbar and members list', () => {
        render(<TeamPageContent />);
        expect(screen.getByTestId('toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('members-list')).toBeInTheDocument();
    });

    it('updates search query when toolbar triggers it', async () => {
        render(<TeamPageContent />);
        await userEvent.click(screen.getByText('Search John'));
        expect(screen.getByText(/Query: John/)).toBeInTheDocument();
    });

    it('updates status filter when toolbar triggers it', async () => {
        render(<TeamPageContent />);
        await userEvent.click(screen.getByText('Filter Published'));
        expect(screen.getByText(/Status: Опубліковано/)).toBeInTheDocument();
    });

    it('updates autocomplete values from members list', () => {
        render(<TeamPageContent />);
        expect(screen.getByText('John,Jane')).toBeInTheDocument();
    });
});
