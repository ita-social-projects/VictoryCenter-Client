import React from 'react';
import { render } from '@testing-library/react';
import { MediaOverlay, MediaOverlayProps } from './MediaOverlay';

describe('MediaOverlay Component', () => {
    const renderComponent = (props: Partial<MediaOverlayProps> = {}) => {
        return render(<MediaOverlay {...props} />);
    };

    describe('Rendering & Structure', () => {
        it('renders correctly with required accessibility attributes', () => {
            const { container } = renderComponent();
            const element = container.firstChild as HTMLElement;

            expect(element).toBeInTheDocument();
            expect(element).toHaveAttribute('aria-hidden', 'true');
            expect(element).toHaveClass('root');
        });

        it('merges custom className with default styles', () => {
            const customClass = 'my-custom-overlay';
            const { container } = renderComponent({ className: customClass });
            const element = container.firstChild as HTMLElement;

            expect(element).toHaveClass('root');
            expect(element).toHaveClass(customClass);
        });
    });

    describe('Style Logic (CSS Variables)', () => {
        it('applies default values when no props are provided', () => {
            const { container } = renderComponent();
            const element = container.firstChild as HTMLElement;

            expect(element).toHaveStyle({
                '--overlay-opacity': '0.2',
                '--overlay-color': '#000000',
                '--overlay-blur': '0',
            });
        });

        it('applies provided opacity and color', () => {
            const props: MediaOverlayProps = {
                opacity: 0.75,
                color: 'rgba(255, 0, 0, 0.5)',
            };
            const { container } = renderComponent(props);
            const element = container.firstChild as HTMLElement;

            expect(element).toHaveStyle({
                '--overlay-opacity': '0.75',
                '--overlay-color': 'rgba(255, 0, 0, 0.5)',
            });
        });

        it('handles blur logic correctly when value > 0', () => {
            const { container } = renderComponent({ blur: 10 });
            const element = container.firstChild as HTMLElement;

            expect(element).toHaveStyle({
                '--overlay-blur': '10px',
            });
        });

        it('handles blur logic correctly when value is 0', () => {
            const { container } = renderComponent({ blur: 0 });
            const element = container.firstChild as HTMLElement;

            expect(element).toHaveStyle({
                '--overlay-blur': '0',
            });
        });
    });
});
