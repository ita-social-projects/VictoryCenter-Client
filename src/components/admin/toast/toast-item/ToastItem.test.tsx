import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastItem } from './ToastItem';
import { Toast, ToastType } from '../../../../types/admin/toast';
import { COMMON_TEXT_ADMIN } from '../../../../const/admin/common';

jest.mock('../../../../assets/icons/info.svg', () => 'mock-info-icon.svg');

describe('ToastItem', () => {
    const mockToast: Toast = {
        id: 1,
        message: 'Test toast message',
        type: ToastType.Info,
        duration: 3000,
    };

    it('renders the toast message', () => {
        render(<ToastItem toast={mockToast} />);
        expect(screen.getByText('Test toast message')).toBeInTheDocument();
    });

    it('applies the correct CSS class based on type', () => {
        render(<ToastItem toast={{ ...mockToast, type: ToastType.Info }} />);
        const toastElement = screen.getByText('Test toast message').closest('div');
        expect(toastElement).toHaveClass('toast');
        expect(toastElement).toHaveClass('info');
    });

    it('renders the icon with correct alt text', () => {
        render(<ToastItem toast={mockToast} />);
        const icon = screen.getByAltText(COMMON_TEXT_ADMIN.ALT.HINT);
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('src', 'mock-info-icon.svg');
    });
});
