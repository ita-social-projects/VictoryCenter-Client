import React from 'react';
import { render, screen } from '@testing-library/react';
import { ToastContainer } from './ToastContainer';
import { useToast } from '../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { Toast } from '../../../../types/admin/toast';

jest.mock('../../../../contexts/admin/toast-context-provider/ToastContextProvider', () => ({
    useToast: jest.fn(),
}));

jest.mock('../toast-item/ToastItem', () => ({
    ToastItem: ({ toast }: { toast: Toast }) => <div data-testid="toast-item">{toast.message}</div>,
}));

describe('ToastContainer', () => {
    const mockUseToast = useToast as jest.Mock;

    it('renders multiple ToastItems when toasts are present', () => {
        mockUseToast.mockReturnValue({
            toasts: [
                { id: 1, message: 'First toast', type: 'info', duration: 3000 },
                { id: 2, message: 'Second toast', type: 'error', duration: 3000 },
            ],
        });

        render(<ToastContainer />);

        const toastItems = screen.getAllByTestId('toast-item');
        expect(toastItems).toHaveLength(2);
        expect(toastItems[0]).toHaveTextContent('First toast');
        expect(toastItems[1]).toHaveTextContent('Second toast');
    });

    it('renders no ToastItems when toasts array is empty', () => {
        mockUseToast.mockReturnValue({ toasts: [] });

        render(<ToastContainer />);

        expect(screen.queryByTestId('toast-item')).toBeNull();
    });
});
