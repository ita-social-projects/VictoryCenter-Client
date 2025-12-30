import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddSectionModal, AddSectionModalProps } from './AddSectionModal';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ButtonProps } from '@/components/admin/button/Button';
import { ModalProps } from '@/components/common/modal/Modal';

const mockRenderProgramSection = jest.fn((_: any) => <div data-testid="rendered-section" />);

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: (args: any) => mockRenderProgramSection(args),
}));

jest.mock('@/assets/icons/chevron-left.svg', () => ({
    ReactComponent: () => <svg data-testid="chevron-left" />,
}));

jest.mock('@/assets/icons/chevron-right.svg', () => ({
    ReactComponent: () => <svg data-testid="chevron-right" />,
}));

jest.mock('@/assets/images/common/section-photo-placeholder.png', () => 'placeholder.png');

jest.mock('@/components/common/modal/Modal', () => {
    const ModalMock = ({ isOpen, onClose, children, maxWidth }: ModalProps & { maxWidth?: string }) =>
        isOpen ? (
            <div data-testid="add-section-modal" data-max-width={maxWidth}>
                <button data-testid="modal-close-btn" onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        ) : null;

    ModalMock.Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
    ModalMock.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ModalMock.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

    return {
        __esModule: true,
        Modal: ModalMock,
    };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, buttonStyle }: ButtonProps & { buttonStyle?: string }) => (
        <button onClick={onClick} disabled={disabled} data-button-style={buttonStyle}>
            {children}
        </button>
    ),
}));

describe('AddSectionModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSelectTemplate = jest.fn();

    const TEMPLATES = [
        ProgramSectionTemplate.QuadImagesBottom,
        ProgramSectionTemplate.DualImagesBottom,
        ProgramSectionTemplate.TextOnly,
        ProgramSectionTemplate.TripleImagesBottom,
        ProgramSectionTemplate.SingleImageBottom,
        ProgramSectionTemplate.SingleImageTop,
        ProgramSectionTemplate.SingleImageRight,
    ];

    const getLastTemplateId = () => {
        const calls = mockRenderProgramSection.mock.calls as unknown as any[];
        const lastCall = calls[calls.length - 1] as any[] | undefined;
        const args = lastCall?.[0] as any;
        return args?.templateId as ProgramSectionTemplate | undefined;
    };

    const defaultProps: AddSectionModalProps = {
        isOpen: true,
        onClose: mockOnClose,
        onSelectTemplate: mockOnSelectTemplate,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render when isOpen is true', () => {
        render(<AddSectionModal {...defaultProps} />);

        expect(screen.getByTestId('add-section-modal')).toBeInTheDocument();
        expect(screen.getByText(PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
        render(<AddSectionModal {...defaultProps} isOpen={false} />);

        expect(screen.queryByTestId('add-section-modal')).not.toBeInTheDocument();
    });

    it('should have correct modal width', () => {
        render(<AddSectionModal {...defaultProps} />);

        const modal = screen.getByTestId('add-section-modal');
        expect(modal).toHaveAttribute('data-max-width', '90vw');
    });

    it('should call onClose when close button is clicked', () => {
        render(<AddSectionModal {...defaultProps} />);

        const closeButton = screen.getByTestId('modal-close-btn');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose and onSelectTemplate when choose template button is clicked', () => {
        render(<AddSectionModal {...defaultProps} />);

        const chooseButton = screen.getByText(PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION);
        fireEvent.click(chooseButton);

        expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should render left and right chevrons', () => {
        render(<AddSectionModal {...defaultProps} />);

        expect(screen.getByTitle('scroll-left-button')).toBeInTheDocument();
        expect(screen.getByTitle('scroll-right-button')).toBeInTheDocument();
    });

    it('should render the modal content area', () => {
        render(<AddSectionModal {...defaultProps} />);

        expect(screen.getByTestId('add-section-modal-content')).toBeInTheDocument();
    });

    it('cycles templates with wrap-around: previous at index 0 -> last, next at last -> 0', () => {
        render(<AddSectionModal {...defaultProps} />);

        expect(mockRenderProgramSection).toHaveBeenCalled();
        expect(getLastTemplateId()).toBe(TEMPLATES[0]);

        fireEvent.click(screen.getByTitle('scroll-left-button'));
        expect(getLastTemplateId()).toBe(TEMPLATES[TEMPLATES.length - 1]);

        fireEvent.click(screen.getByTitle('scroll-right-button'));
        expect(getLastTemplateId()).toBe(TEMPLATES[0]);
    });

    it('moves between adjacent templates: next increments, previous decrements', () => {
        render(<AddSectionModal {...defaultProps} />);

        fireEvent.click(screen.getByTitle('scroll-right-button'));
        expect(getLastTemplateId()).toBe(TEMPLATES[1]);

        fireEvent.click(screen.getByTitle('scroll-left-button'));
        expect(getLastTemplateId()).toBe(TEMPLATES[0]);
    });

    it('selects the currently shown template when saving', () => {
        render(<AddSectionModal {...defaultProps} />);

        fireEvent.click(screen.getByTitle('scroll-right-button'));
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION));

        expect(mockOnSelectTemplate).toHaveBeenCalledWith(TEMPLATES[1]);
        expect(mockOnClose).toHaveBeenCalled();
    });
});
