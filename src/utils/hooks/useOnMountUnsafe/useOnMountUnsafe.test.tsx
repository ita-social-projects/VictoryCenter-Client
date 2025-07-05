import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { useOnMountUnsafe } from './useOnMountUnsafe';

function TestComponent({ effect }: { effect: () => void }) {
    useOnMountUnsafe(effect);
    return null;
}

describe('useOnMountUnsafe', () => {
    it('calls the effect exactly once on initial render', () => {
        const effect = jest.fn();
        const { rerender } = render(<TestComponent effect={effect} />);

        expect(effect).toHaveBeenCalledTimes(1);

        rerender(<TestComponent effect={effect} />);
        rerender(<TestComponent effect={effect} />);
        expect(effect).toHaveBeenCalledTimes(1);
    });

    it('only calls once even in Strict mode', () => {
        const effect = jest.fn();
        render(
            <StrictMode>
                <TestComponent effect={effect} />
            </StrictMode>
        );

        expect(effect).toHaveBeenCalledTimes(1);
    });
});
