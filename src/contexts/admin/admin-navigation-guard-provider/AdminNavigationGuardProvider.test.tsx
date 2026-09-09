import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminNavigationGuardProvider, useAdminNavigationGuard } from './AdminNavigationGuardProvider';

const TestConsumer = () => {
    const { isBlocked, blockMessage, setBlocked } = useAdminNavigationGuard();
    return (
        <div>
            <span data-testid="is-blocked">{String(isBlocked)}</span>
            <span data-testid="block-message">{blockMessage ?? 'null'}</span>
            <button onClick={() => setBlocked(true, 'Завершіть звіт')}>block-with-message</button>
            <button onClick={() => setBlocked(true)}>block-without-message</button>
            <button onClick={() => setBlocked(false)}>unblock</button>
        </div>
    );
};

describe('AdminNavigationGuardProvider', () => {
    it('provides default unblocked state with no message', () => {
        render(
            <AdminNavigationGuardProvider>
                <TestConsumer />
            </AdminNavigationGuardProvider>,
        );

        expect(screen.getByTestId('is-blocked')).toHaveTextContent('false');
        expect(screen.getByTestId('block-message')).toHaveTextContent('null');
    });

    it('sets isBlocked and blockMessage when setBlocked is called with a message', () => {
        render(
            <AdminNavigationGuardProvider>
                <TestConsumer />
            </AdminNavigationGuardProvider>,
        );

        fireEvent.click(screen.getByText('block-with-message'));

        expect(screen.getByTestId('is-blocked')).toHaveTextContent('true');
        expect(screen.getByTestId('block-message')).toHaveTextContent('Завершіть звіт');
    });

    it('sets blockMessage to null when setBlocked(true) is called without a message', () => {
        render(
            <AdminNavigationGuardProvider>
                <TestConsumer />
            </AdminNavigationGuardProvider>,
        );

        fireEvent.click(screen.getByText('block-without-message'));

        expect(screen.getByTestId('is-blocked')).toHaveTextContent('true');
        expect(screen.getByTestId('block-message')).toHaveTextContent('null');
    });

    it('clears both isBlocked and blockMessage when setBlocked(false) is called', () => {
        render(
            <AdminNavigationGuardProvider>
                <TestConsumer />
            </AdminNavigationGuardProvider>,
        );

        fireEvent.click(screen.getByText('block-with-message'));
        expect(screen.getByTestId('is-blocked')).toHaveTextContent('true');
        expect(screen.getByTestId('block-message')).toHaveTextContent('Завершіть звіт');

        fireEvent.click(screen.getByText('unblock'));

        expect(screen.getByTestId('is-blocked')).toHaveTextContent('false');
        expect(screen.getByTestId('block-message')).toHaveTextContent('null');
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

        expect(screen.getByTestId('is-blocked')).toHaveTextContent('true');
        expect(screen.getByTestId('second-is-blocked')).toHaveTextContent('true');
        expect(screen.getByTestId('second-block-message')).toHaveTextContent('Завершіть звіт');
    });

    it('falls back to the default no-op context value when used outside a provider', () => {
        render(<TestConsumer />);

        expect(screen.getByTestId('is-blocked')).toHaveTextContent('false');
        expect(() => fireEvent.click(screen.getByText('block-with-message'))).not.toThrow();
        expect(screen.getByTestId('is-blocked')).toHaveTextContent('false');
        expect(screen.getByTestId('block-message')).toHaveTextContent('null');
    });
});
