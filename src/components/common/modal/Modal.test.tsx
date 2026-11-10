import React, { HTMLAttributes, ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal, ModalProps } from './Modal';

const mockOnClose = jest.fn();

const defaultProps: ModalProps = {
    isOpen: true,
    fullscreen: false,
    onClose: mockOnClose,
};

const mockParentClick = jest.fn();

type ModalElements = { overlay: HTMLElement; container: HTMLElement };

const getModalElements = (): ModalElements => ({
    overlay: screen.getByTestId('modal-overlay'),
    container: document.querySelector('.modal-container') as HTMLElement,
});

const renderModal = (children: ReactNode = <Modal.Content>Content</Modal.Content>) => {
    render(<Modal {...defaultProps}>{children}</Modal>);
    return getModalElements();
};

const renderDraggableModal = (innerProps: HTMLAttributes<HTMLDivElement> = {}) => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const elements = renderModal(
        <Modal.Content>
            <div data-testid="inner" {...innerProps}>
                Draggable
            </div>
        </Modal.Content>,
    );
    return { ...elements, inner: screen.getByTestId('inner') };
};

const renderModalInsideParent = () => {
    render(
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div onClick={mockParentClick}>
            <Modal {...defaultProps}>
                <Modal.Content>Content</Modal.Content>
            </Modal>
        </div>,
    );
    return getModalElements();
};

const pressAndRelease = (pressTarget: Element, releaseTarget: Element = pressTarget) => {
    fireEvent.pointerDown(pressTarget);
    fireEvent.click(releaseTarget);
};

describe('Modal Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        // Reset body overflow
        document.body.style.overflow = '';
    });

    test('does not render when isOpen is false', () => {
        render(
            <Modal {...defaultProps} isOpen={false}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
                <Modal.Actions>Actions</Modal.Actions>
            </Modal>,
        );
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        expect(document.querySelector('.modal-container')).toBeNull();
    });

    test('renders modal with all sub-components when isOpen is true', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Modal Title</Modal.Title>
                <Modal.Content>Modal Content</Modal.Content>
                <Modal.Actions>Modal Actions</Modal.Actions>
            </Modal>,
        );
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('Modal Title')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
        expect(screen.getByText('Modal Actions')).toBeInTheDocument();
        expect(document.querySelector('.modal-container')).toBeInTheDocument();
    });

    test('calls onClose when clicking close button', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        const closeButton = screen.getByLabelText('Close modal');
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when pressing Escape key', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        fireEvent.keyDown(document, { key: 'Escape' });
        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    test('calls onClose when pressing Enter or Space on overlay', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );

        const overlay = screen.getByTestId('modal-overlay');

        // The overlay now has onKeyDown handler that calls handleOverlayClick
        fireEvent.keyDown(overlay, { key: 'Enter', target: overlay, currentTarget: overlay });
        expect(mockOnClose).toHaveBeenCalledTimes(1);

        mockOnClose.mockClear();

        fireEvent.keyDown(overlay, { key: ' ', target: overlay, currentTarget: overlay });
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onClose when pressing keys inside modal container', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        const modalContainer = document.querySelector('.modal-container');

        // Modal container has stopPropagation on keyDown, so these shouldn't reach overlay
        fireEvent.keyDown(modalContainer!, { key: 'Enter' });
        fireEvent.keyDown(modalContainer!, { key: ' ' });
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    describe('drag behaviour', () => {
        test.each([
            ['a plain child', {}],
            [
                'a child that stops pointerdown propagation (capture phase)',
                { onPointerDown: (e: React.PointerEvent) => e.stopPropagation() },
            ],
        ])('does NOT call onClose when drag starts inside modal on %s and ends on overlay', (_name, innerProps) => {
            const { overlay, inner } = renderDraggableModal(innerProps);

            pressAndRelease(inner, overlay);

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        test('resets drag state after an interrupted drag, so the next overlay click closes the modal', () => {
            const { overlay, inner } = renderDraggableModal();

            pressAndRelease(inner, overlay);
            expect(mockOnClose).not.toHaveBeenCalled();

            pressAndRelease(overlay);
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('event bubbling through the React tree (portal)', () => {
        test.each([
            ['drag started inside and ended on overlay', 'container', 'overlay', 0],
            ['click on overlay', 'overlay', 'overlay', 1],
            ['click inside container', 'container', 'container', 0],
        ] as const)('%s: onClose x%i, parent onClick not called', (_name, press, release, closeCalls) => {
            const view = renderModalInsideParent();

            pressAndRelease(view[press], view[release]);

            expect(mockOnClose).toHaveBeenCalledTimes(closeCalls);
            expect(mockParentClick).not.toHaveBeenCalled();
        });
    });

    test('renders without title, content, or actions when not provided', () => {
        render(<Modal {...defaultProps} />);
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(document.querySelector('.modal-header-text')?.textContent).toBe('');
        expect(document.querySelector('.modal-body')?.textContent).toBe('');
        expect(document.querySelector('.modal-footer')?.textContent).toBe('');
    });

    test('adds and removes keydown event listener and body overflow based on isOpen', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        const { rerender } = render(<Modal {...defaultProps} />);
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(document.body.style.overflow).toBe('hidden');
        rerender(<Modal {...defaultProps} isOpen={false} />);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(document.body.style.overflow).not.toBe('hidden');
    });

    test('does not call onClose for other keys in modal container', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
            </Modal>,
        );
        const modalContainer = document.querySelector('.modal-container');
        fireEvent.keyDown(modalContainer!, { key: 'Tab' });
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('restores previous body overflow style after close', () => {
        document.body.style.overflow = 'scroll';
        const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);
        expect(document.body.style.overflow).toBe('hidden');
        rerender(<Modal {...defaultProps} isOpen={false} />);
        expect(document.body.style.overflow).toBe('scroll');
    });

    test('multiple modals do not interfere with each other', () => {
        const onClose1 = jest.fn();
        const onClose2 = jest.fn();
        const { rerender } = render(
            <>
                <Modal isOpen={true} onClose={onClose1} />
                <Modal isOpen={true} onClose={onClose2} />
            </>,
        );
        // Both overlays present
        expect(document.querySelectorAll('.modal-overlay').length).toBe(2);
        // Close one
        rerender(
            <>
                <Modal isOpen={false} onClose={onClose1} />
                <Modal isOpen={true} onClose={onClose2} />
            </>,
        );
        expect(document.querySelectorAll('.modal-overlay').length).toBe(1);
        // Close both
        rerender(
            <>
                <Modal isOpen={false} onClose={onClose1} />
                <Modal isOpen={false} onClose={onClose2} />
            </>,
        );
        expect(document.querySelectorAll('.modal-overlay').length).toBe(0);
    });

    test('handles Modal.Title/Content/Actions as fragments and arrays', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>
                    <>
                        <span>Fragment Title</span>
                    </>
                </Modal.Title>
                <Modal.Content>{[<span key="c">Array Content</span>]}</Modal.Content>
                <Modal.Actions>
                    <>
                        <span>Fragment Actions</span>
                    </>
                </Modal.Actions>
            </Modal>,
        );
        expect(screen.getByText('Fragment Title')).toBeInTheDocument();
        expect(screen.getByText('Array Content')).toBeInTheDocument();
        expect(screen.getByText('Fragment Actions')).toBeInTheDocument();
    });

    test('closes when mousedown starts outside modal and ends outside', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );

        const overlay = screen.getByTestId('modal-overlay');

        // Start mousedown on overlay (sets mouseDownInsideModal.current = false)
        fireEvent.mouseDown(overlay, { target: overlay, currentTarget: overlay });
        // Then click on overlay (should close)
        fireEvent.click(overlay, { target: overlay, currentTarget: overlay });

        expect(mockOnClose).toHaveBeenCalled();
    });

    test('focus trap does nothing when no focusable elements exist', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>No buttons here</Modal.Content>
            </Modal>,
        );

        const modalContainer = document.querySelector('.modal-container')!;
        fireEvent.keyDown(modalContainer, { key: 'Tab' }); // should not throw or change focus
        // Just verify it doesn't throw an error
        expect(modalContainer).toBeInTheDocument();
    });

    test('trapFocus early returns when key is not Tab', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>
                    <button>Focusable</button>
                </Modal.Content>
            </Modal>,
        );

        const modalContainer = document.querySelector('.modal-container')!;
        // Should return immediately without errors
        fireEvent.keyDown(modalContainer, { key: 'Enter' });
        expect(modalContainer).toBeInTheDocument();
    });

    test('trapFocus returns when there are no focusable elements', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>No focusable elements here</Modal.Content>
            </Modal>,
        );

        const modalContainer = document.querySelector('.modal-container')!;
        fireEvent.keyDown(modalContainer, { key: 'Tab' });
        expect(modalContainer).toBeInTheDocument();
    });

    test('traps focus backward: shift-tabbing from the first element moves focus to the last', async () => {
        const user = userEvent.setup();

        render(
            <Modal {...defaultProps}>
                <Modal.Content>
                    <input data-testid="input1" />
                    <button data-testid="button1">Button 1</button>
                </Modal.Content>
                <Modal.Actions>
                    <button data-testid="button2">OK</button>
                </Modal.Actions>
            </Modal>,
        );

        const firstFocusableElement = screen.getByLabelText('Close modal');
        const lastFocusableElement = screen.getByTestId('button2');

        expect(firstFocusableElement).toHaveFocus();

        await user.tab({ shift: true });

        expect(lastFocusableElement).toHaveFocus();
    });

    test('applies "fullscreen" class to container when fullScreen prop is true', () => {
        render(
            <Modal {...defaultProps} fullscreen={true}>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        const modalContainer = document.querySelector('.modal-container');
        expect(modalContainer).toHaveClass('fullscreen');
    });

    test('does not apply "fullscreen" class when fullScreen prop is false or undefined', () => {
        const { rerender } = render(
            <Modal {...defaultProps} fullscreen={false}>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        let modalContainer = document.querySelector('.modal-container');
        expect(modalContainer).not.toHaveClass('fullscreen');

        // Test default (undefined) behavior
        rerender(
            <Modal {...defaultProps}>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        modalContainer = document.querySelector('.modal-container');
        expect(modalContainer).not.toHaveClass('fullscreen');
    });
});
