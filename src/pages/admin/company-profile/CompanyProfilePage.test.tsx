import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompanyProfilePage } from './CompanyProfilePage';

jest.mock('./components/company-profile-content/CompanyProfileContent', () => ({
    CompanyProfileContent: () => <div data-testid="company-profile-content" />,
}));

describe('CompanyProfilePage', () => {
    it('renders CompanyProfileContent', () => {
        render(<CompanyProfilePage />);
        expect(screen.getByTestId('company-profile-content')).toBeInTheDocument();
    });
});
