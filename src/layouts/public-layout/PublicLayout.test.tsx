import React from 'react';
import { render, screen } from '@testing-library/react';
import { PublicLayout } from './PublicLayout';
import { useLocation } from 'react-router-dom';

jest.mock('@/components/public/header/Header', () => ({
    Header: () => <div>Mocked Header</div>,
}));
jest.mock('@/components/public/footer/Footer', () => ({
    Footer: () => <div>Mocked Footer</div>,
}));

const mockScrollTo = jest.fn();
Object.defineProperty(window, 'scrollTo', {
    value: mockScrollTo,
    writable: true,
});

const mockedUseLocation = useLocation as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();

    mockedUseLocation.mockReturnValue({
        pathname: '/',
        search: '',
        hash: '',
        state: null,
        key: 'testKey',
    });
});

describe('PublicLayout', () => {
    test('should render Header, Outlet, and Footer correctly', () => {
        render(<PublicLayout />);

        expect(screen.getByText('Mocked Header')).toBeInTheDocument();
        expect(screen.getByText('Mocked Footer')).toBeInTheDocument();
        expect(screen.getByText('Mocked Outlet')).toBeInTheDocument();
    });

    test('should call window.scrollTo with behavior: "auto" on initial render', () => {
        render(<PublicLayout />);

        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: 'auto',
        });
    });

    test('should call window.scrollTo with behavior: "smooth" when prop is passed', () => {
        render(<PublicLayout behavior="smooth" />);

        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth',
        });
    });

    test('should call window.scrollTo again when pathname changes', () => {
        mockedUseLocation.mockReturnValue({ pathname: '/page1' });

        const { rerender } = render(<PublicLayout />);

        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });

        mockScrollTo.mockClear();

        mockedUseLocation.mockReturnValue({ pathname: '/page2' });

        rerender(<PublicLayout />);

        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    });

    test('should not call window.scrollTo again if pathname has not changed', () => {
        mockedUseLocation.mockReturnValue({ pathname: '/page1' });
        const { rerender } = render(<PublicLayout />);

        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        mockScrollTo.mockClear();

        rerender(<PublicLayout />);

        expect(mockScrollTo).not.toHaveBeenCalled();
    });
});
