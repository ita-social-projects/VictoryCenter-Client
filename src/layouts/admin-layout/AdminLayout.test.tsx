import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AdminLayout } from './AdminLayout';

jest.mock('@/components/admin/admin-navigation/AdminNavigation', () => ({
    AdminNavigation: () => <nav data-testid="admin-navigation">nav</nav>,
}));

jest.mock('react-router-dom', () => ({
    Outlet: () => <div data-testid="outlet">outlet</div>,
}));

describe('AdminLayout', () => {
    it('renders navigation container', () => {
        const { container } = render(<AdminLayout />);
        const nav = container.querySelector('.admin__navigation');
        expect(nav).toBeInTheDocument();
    });

    it('renders AdminNavigation', () => {
        render(<AdminLayout />);
        expect(screen.getByTestId('admin-navigation')).toBeInTheDocument();
    });

    it('renders page container', () => {
        const { container } = render(<AdminLayout />);
        const page = container.querySelector('.admin__page');
        expect(page).toBeInTheDocument();
    });

    it('renders Outlet', () => {
        render(<AdminLayout />);
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });

    it('applies root admin class', () => {
        const { container } = render(<AdminLayout />);
        expect(container.firstChild).toHaveClass('admin');
    });
});
