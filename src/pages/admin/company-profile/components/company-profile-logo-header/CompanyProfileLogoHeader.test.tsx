import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompanyProfileLogoHeader } from './CompanyProfileLogoHeader';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';

jest.mock('@/assets/icons/logo.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="logo-icon" />,
}));

describe('CompanyProfileLogoHeader', () => {
    it('renders title and subtitle', () => {
        render(<CompanyProfileLogoHeader isEditMode={false} />);

        expect(screen.getByText(COMPANY_PROFILE_TEXT.HEADER.TITLE)).toBeInTheDocument();
        expect(screen.getByText(COMPANY_PROFILE_TEXT.HEADER.SUBTITLE)).toBeInTheDocument();
        expect(screen.getByTestId('logo-icon')).toBeInTheDocument();
    });

    it('adds editing modifier class when isEditMode=true', () => {
        const { container } = render(<CompanyProfileLogoHeader isEditMode={true} />);
        expect(container.querySelector('.company-header--editing')).toBeInTheDocument();
    });

    it('does not add editing modifier class when isEditMode=false', () => {
        const { container } = render(<CompanyProfileLogoHeader isEditMode={false} />);
        expect(container.querySelector('.company-header--editing')).not.toBeInTheDocument();
    });
});
