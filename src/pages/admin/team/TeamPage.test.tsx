import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TeamPageAdmin } from './TeamPage';

jest.mock('./components/team-page-content/TeamPageContent', () => ({
    TeamPageContent: () => <div data-testid="team-page-content" />,
}));

describe('TeamPageAdmin', () => {
    it('renders TeamPageContent', () => {
        render(<TeamPageAdmin />);
        expect(screen.getByTestId('team-page-content')).toBeInTheDocument();
    });
});
