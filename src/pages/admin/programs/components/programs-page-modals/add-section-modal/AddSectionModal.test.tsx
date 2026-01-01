import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddSectionModal, AddSectionModalProps } from './AddSectionModal';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ButtonProps } from '@/components/admin/button/Button';
import { ModalProps } from '@/components/common/modal/Modal';

const mockRenderProgramSection = jest.fn((_: any) => <div data-testid="rendered-section" />);

let mockSwiperActiveIndex = 0;
let mockSwiperOnSlideChange: ((index: number) => void) | undefined;

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: (args: any) => mockRenderProgramSection(args),
}));

jest.mock('@/components/public/swiper/Swiper', () => ({
    Swiper: ({ items, renderItem, onSlideChange, className }: any) => {
        mockSwiperOnSlideChange = onSlideChange;
        // Initialize on first render
        if (mockSwiperActiveIndex === -1) {
            mockSwiperActiveIndex = 0;
            setTimeout(() => onSlideChange?.(0), 0);
        }

        const handlePrev = () => {
            mockSwiperActiveIndex = mockSwiperActiveIndex === 0 ? items.length - 1 : mockSwiperActiveIndex - 1;
            mockSwiperOnSlideChange?.(mockSwiperActiveIndex);
        };

        const handleNext = () => {
            mockSwiperActiveIndex = mockSwiperActiveIndex === items.length - 1 ? 0 : mockSwiperActiveIndex + 1;
            mockSwiperOnSlideChange?.(mockSwiperActiveIndex);
        };

        return (
            <div data-testid="swiper" className={className}>
                {items.map((item: any, index: number) => (
                    <div key={index} data-testid="swiper-slide">
                        {renderItem(item, index)}
                    </div>
                ))}
                <div className="button-container">
                    <button
                        type="button"
                        onClick={handlePrev}
                        className="arrow-button arrow-left"
                        title="Previous slide"
                    >
                        <svg className="arrow-icon" />
                    </button>
                    <button type="button" onClick={handleNext} className="arrow-button arrow-right" title="Next slide">
                        <svg className="arrow-icon" />
                    </button>
                </div>
            </div>
        );
    },
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
        mockSwiperActiveIndex = 0;
        mockSwiperOnSlideChange = undefined;
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

        expect(screen.getByTitle('Previous slide')).toBeInTheDocument();
        expect(screen.getByTitle('Next slide')).toBeInTheDocument();
    });

    it('should render the modal content area', () => {
        render(<AddSectionModal {...defaultProps} />);

        expect(screen.getAllByTestId('add-section-modal-content')[0]).toBeInTheDocument();
    });

    it('cycles templates with wrap-around: previous at index 0 -> last, next at last -> 0', () => {
        render(<AddSectionModal {...defaultProps} />);

        expect(mockRenderProgramSection).toHaveBeenCalled();

        fireEvent.click(screen.getByTitle('Previous slide'));
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION));
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(TEMPLATES[TEMPLATES.length - 1]);

        mockOnSelectTemplate.mockClear();
        mockSwiperActiveIndex = TEMPLATES.length - 1;

        fireEvent.click(screen.getByTitle('Next slide'));
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION));
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(TEMPLATES[0]);
    });

    it('moves between adjacent templates: next increments, previous decrements', () => {
        render(<AddSectionModal {...defaultProps} />);

        fireEvent.click(screen.getByTitle('Next slide'));
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION));
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(TEMPLATES[1]);

        mockOnSelectTemplate.mockClear();
        mockSwiperActiveIndex = 1;
        fireEvent.click(screen.getByTitle('Previous slide'));
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION));
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(TEMPLATES[0]);
    });

    it('selects the currently shown template when saving', () => {
        render(<AddSectionModal {...defaultProps} />);

        fireEvent.click(screen.getByTitle('Next slide'));
        fireEvent.click(screen.getByText(PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION));

        expect(mockOnSelectTemplate).toHaveBeenCalledWith(TEMPLATES[1]);
        expect(mockOnClose).toHaveBeenCalled();
    });
});
