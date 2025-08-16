import React from 'react';
import { render, screen } from '@testing-library/react';
import { ProgramsPageAdmin } from './ProgramsPageAdmin';

jest.mock('./components/programs-page-content/ProgramsPageContent', () => ({
    ProgramsPageContent: () => <div data-testid="programs-page-content">Programs Content</div>,
}));

describe('ProgramsPageAdmin', () => {
    it('should render ProgramsPageContent', () => {
        render(<ProgramsPageAdmin />);
        expect(screen.getByTestId('programs-page-content')).toBeInTheDocument();
        expect(screen.getByText('Programs Content')).toBeInTheDocument();
    });
});
