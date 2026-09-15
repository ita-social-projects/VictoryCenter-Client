import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminNavigationGuardProvider, useAdminNavigationGuard } from './AdminNavigationGuardProvider';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const TestConsumer = () => {
    const { isBlocked, blockMessage, setBlocked } = useAdminNavigationGuard();
    return (
        <div>
            <span data-testid="is-blocked">{String(isBlocked)}</span>
            <span data-testid="block-message">{blockMessage ?? 'null'}</span>
            <button onClick={() => setBlocked(true, COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED)}>
                block-with-message
            </button>
            <button onClick={() => setBlocked(true)}>block-without-message</button>
            <button onClick={() => setBlocked(false)}>unblock</button>
        </div>
    );
};

const renderWithProvider = () =>
    render(
        <AdminNavigationGuardProvider>
            <TestConsumer />
        </AdminNavigationGuardProvider>,
    );

const expectState = (isBlocked: boolean, message: string | null) => {
    expect(screen.getByTestId('is-blocked')).toHaveTextContent(String(isBlocked));
    expect(screen.getByTestId('block-message')).toHaveTextContent(message ?? 'null');
};

describe('AdminNavigationGuardProvider', () => {
    it('provides default unblocked state with no message', () => {
        renderWithProvider();
        expectState(false, null);
    });

    it('sets isBlocked and blockMessage when setBlocked is called with a message', () => {
        renderWithProvider();
        fireEvent.click(screen.getByText('block-with-message'));
        expectState(true, COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED);
    });

    it('sets blockMessage to null when setBlocked(true) is called without a message', () => {
        renderWithProvider();
        fireEvent.click(screen.getByText('block-without-message'));
        expectState(true, null);
    });

    it('clears both isBlocked and blockMessage when setBlocked(false) is called', () => {
        renderWithProvider();

        fireEvent.click(screen.getByText('block-with-message'));
        expectState(true, COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED);

        fireEvent.click(screen.getByText('unblock'));
        expectState(false, null);
    });

    it('shares the same state across multiple consumers under one provider', () => {
        const SecondConsumer = () => {
            const { isBlocked, blockMessage } = useAdminNavigationGuard();
            return (
                <div>
                    <span data-testid="second-is-blocked">{String(isBlocked)}</span>
                    <span data-testid="second-block-message">{blockMessage ?? 'null'}</span>
                </div>
            );
        };

        render(
            <AdminNavigationGuardProvider>
                <TestConsumer />
                <SecondConsumer />
            </AdminNavigationGuardProvider>,
        );

        fireEvent.click(screen.getByText('block-with-message'));

        expectState(true, COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED);

        expect(screen.getByTestId('second-is-blocked')).toHaveTextContent('true');
        expect(screen.getByTestId('second-block-message')).toHaveTextContent(
            COMMON_TEXT_ADMIN.MESSAGE.NAVIGATION_BLOCKED,
        );
    });

    it('falls back to the default no-op context value when used outside a provider', () => {
        render(<TestConsumer />);

        expectState(false, null);
        expect(() => fireEvent.click(screen.getByText('block-with-message'))).not.toThrow();
        expectState(false, null);
    });
});
