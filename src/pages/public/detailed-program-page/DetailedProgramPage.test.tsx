import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DetailedProgramPage } from './DetailedProgramPage';

jest.mock('./components/detailed-program-page-content/DetailedProgramPageContent', () => ({
    DetailedProgramPageContent: () => <div data-testid="detailed-program-page-content" />,
}));

describe('DetailedProgramPage', () => {
    it('renders DetailedProgramPageContent', () => {
        render(<DetailedProgramPage />);
        expect(screen.getByTestId('detailed-program-page-content')).toBeInTheDocument();
    });
});
