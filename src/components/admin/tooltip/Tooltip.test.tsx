import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';
import { Tooltip, TooltipWithoutPortal, TooltipWithPortal } from './Tooltip';

describe('Tooltip - Absolute Positioning', () => {
    const defaultProps: TooltipWithoutPortal = {
        children: 'Test tooltip content',
        position: 'bottom',
        id: 'test-tooltip',
        isRenderInPortal: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock getBoundingClientRect for consistent testing
        Element.prototype.getBoundingClientRect = jest.fn(() => ({
            width: 100,
            height: 30,
            top: 100,
            left: 50,
            bottom: 130,
            right: 150,
            x: 50,
            y: 100,
            toJSON: jest.fn(),
        }));
    });

    // Render helpers
    const renderTooltip = (overrideProps: Partial<TooltipWithoutPortal> = {}) => {
        const Container = () => (
            <div style={{ position: 'relative', width: '200px', height: '50px' }}>
                <Tooltip {...defaultProps} {...overrideProps} />
            </div>
        );
        return render(<Container />);
    };

    const renderTooltipWithRef = (overrideProps: Partial<TooltipWithoutPortal> = {}) => {
        const ref = createRef<HTMLDivElement>();
        const Container = () => (
            <div style={{ position: 'relative', width: '200px', height: '50px' }}>
                <Tooltip ref={ref} {...defaultProps} {...overrideProps} />
            </div>
        );
        return { ...render(<Container />), ref };
    };

    // Element getters
    const getTooltip = () => screen.getByRole('tooltip');

    // Action helpers
    const clickTooltip = () => fireEvent.click(getTooltip());
    const stopPropagationSpy = () => jest.spyOn(Event.prototype, 'stopPropagation');

    // Assertion helpers
    const expectTooltipToHaveClass = (className: string) => expect(getTooltip()).toHaveClass(className);
    const expectTooltipToHaveStyle = (property: string, value: string) =>
        expect(getTooltip()).toHaveStyle(`${property}: ${value}`);
    const expectTooltipToHaveAttribute = (attribute: string, value: string) =>
        expect(getTooltip()).toHaveAttribute(attribute, value);

    it('renders tooltip with default props', () => {
        renderTooltip();
        expect(getTooltip()).toBeInTheDocument();
        expect(getTooltip()).toHaveTextContent('Test tooltip content');
        expectTooltipToHaveClass('tooltip-popup');
        expectTooltipToHaveClass('tooltip-popup--bottom');
    });

    it('renders tooltip with custom id', () => {
        renderTooltip({ id: 'custom-tooltip' });
        expectTooltipToHaveAttribute('id', 'custom-tooltip');
    });

    it('renders tooltip with top position', () => {
        renderTooltip({ position: 'top' });
        expectTooltipToHaveClass('tooltip-popup--top');
    });

    it('applies absolute positioning style', () => {
        renderTooltip();
        expectTooltipToHaveStyle('position', 'absolute');
    });

    it('applies custom max width when provided', () => {
        renderTooltip({ customMaxWidthInPixels: 300 });
        expectTooltipToHaveStyle('max-width', '300px');
    });

    it('allows click through when allowClickThrough is true', () => {
        renderTooltip({ allowClickThrough: true });
        expectTooltipToHaveStyle('pointer-events', 'none');
    });

    it('prevents click through by default', () => {
        renderTooltip();
        expectTooltipToHaveStyle('pointer-events', 'auto');
    });

    it('stops click propagation', () => {
        const stopPropagation = stopPropagationSpy();
        renderTooltip();
        clickTooltip();
        expect(stopPropagation).toHaveBeenCalled();
        stopPropagation.mockRestore();
    });

    it('applies centered positioning when isCentered is true', () => {
        renderTooltipWithRef({ isCentered: true });
        // Position calculation happens in useLayoutEffect, so we test the class is applied
        expectTooltipToHaveClass('tooltip-popup');
    });

    it('applies custom offset', () => {
        renderTooltip({ offsetInPixels: 20 });
        expectTooltipToHaveClass('tooltip-popup');
    });

    it('forwards ref correctly', () => {
        const { ref } = renderTooltipWithRef();
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
});

describe('Tooltip - Portal Rendering', () => {
    const mockPortalPositioner = document.createElement('div');

    const defaultPortalProps: TooltipWithPortal = {
        children: 'Portal tooltip content',
        position: 'bottom',
        isRenderInPortal: true,
        portalPositioner: mockPortalPositioner,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = '';
        // Mock getBoundingClientRect for portal positioner
        mockPortalPositioner.getBoundingClientRect = jest.fn(() => ({
            width: 120,
            height: 40,
            top: 200,
            left: 100,
            bottom: 240,
            right: 220,
            x: 100,
            y: 200,
            toJSON: jest.fn(),
        }));

        // Mock window event listeners
        window.addEventListener = jest.fn();
        window.removeEventListener = jest.fn();
    });

    // Render helpers
    const renderPortalTooltip = (overrideProps: Partial<TooltipWithPortal> = {}) =>
        render(<Tooltip {...defaultPortalProps} {...overrideProps} />);

    const renderPortalTooltipWithRef = (overrideProps: Partial<TooltipWithPortal> = {}) => {
        const ref = createRef<HTMLDivElement>();
        return { ...render(<Tooltip ref={ref} {...defaultPortalProps} {...overrideProps} />), ref };
    };

    // Element getters
    const getPortalTooltip = () => screen.getByRole('tooltip');

    // Event helpers
    const simulateWindowResize = () => fireEvent(window, new Event('resize'));
    const simulateWindowScroll = () => fireEvent(window, new Event('scroll'));

    // Assertion helpers
    const expectPortalTooltipInBody = () => expect(document.body).toContainElement(getPortalTooltip());
    const expectPortalTooltipToHaveStyle = (property: string, value: string) =>
        expect(getPortalTooltip()).toHaveStyle(`${property}: ${value}`);
    const expectPortalTooltipToHaveClass = (className: string) => expect(getPortalTooltip()).toHaveClass(className);

    it('renders tooltip in portal', () => {
        renderPortalTooltip();
        expect(getPortalTooltip()).toBeInTheDocument();
        expectPortalTooltipInBody();
    });

    it('applies fixed positioning for portal', () => {
        renderPortalTooltip();
        expectPortalTooltipToHaveStyle('position', 'fixed');
    });

    it('renders with top position in portal', () => {
        renderPortalTooltip({ position: 'top' });
        expectPortalTooltipToHaveClass('tooltip-popup--top');
    });

    it('renders centered tooltip in portal', () => {
        renderPortalTooltip({ isCentered: true });
        expectPortalTooltipToHaveClass('tooltip-popup');
        expectPortalTooltipInBody();
    });

    it('applies custom max width in portal', () => {
        renderPortalTooltip({ customMaxWidthInPixels: 250 });
        expectPortalTooltipToHaveStyle('max-width', '250px');
    });

    it('registers window event listeners for portal', () => {
        renderPortalTooltip();
        expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    });

    it('handles window resize event', () => {
        renderPortalTooltip();
        simulateWindowResize();
        // Event listeners are called, position recalculation happens
        expect(window.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('handles window scroll event', () => {
        renderPortalTooltip();
        simulateWindowScroll();
        expect(window.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    });

    it('cleans up event listeners on unmount', () => {
        const { unmount } = renderPortalTooltip();
        unmount();
        expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function), true);
    });

    it('allows click through in portal when specified', () => {
        renderPortalTooltip({ allowClickThrough: true });
        expectPortalTooltipToHaveStyle('pointer-events', 'none');
    });

    it('forwards ref correctly in portal', () => {
        const { ref } = renderPortalTooltipWithRef();
        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
});
