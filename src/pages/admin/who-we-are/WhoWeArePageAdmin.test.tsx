import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WhoWeArePageAdmin } from './WhoWeArePageAdmin';

// Mock the nested component to ensure you're only testing the wrapper
jest.mock('./components/who-we-are-content/WhoWeAreContent', () => ({
    WhoWeAreContent: () => <div data-testid="who-we-are-content-mock" />,
}));

describe('WhoWeArePageAdmin', () => {
    it('renders the WhoWeAreContent component', () => {
        render(<WhoWeArePageAdmin />);
        const whoWeAreContent = screen.getByTestId('who-we-are-content-mock');
        expect(whoWeAreContent).toBeInTheDocument();
    });
});