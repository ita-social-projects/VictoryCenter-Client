import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AddSectionModal } from './AddSectionModal';
import type { AddSectionModalProps } from './AddSectionModal';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import type { ButtonProps } from '@/components/admin/button/Button';
import type { ModalProps } from '@/components/common/modal/Modal';

const mockRenderProgramSection = jest.fn((_: any) => <div data-testid="rendered-section" />);

let mockSwiperActiveIndex = 0;
let mockSwiperItems: any[] = [];
let mockSwiperExtraItems: any[] = [];

jest.mock('@/utils/functions/render-program-section', () => ({
    renderProgramSection: (payload: any) => mockRenderProgramSection(payload),
}));

jest.mock('@/components/public/swiper/Swiper', () => ({
    Swiper: ({ items, renderItem, onSlideChange, className }: any) => {
        const allItems = [...items, ...mockSwiperExtraItems];
        mockSwiperItems = allItems;

        const handlePrev = () => {
            mockSwiperActiveIndex = mockSwiperActiveIndex === 0 ? allItems.length - 1 : mockSwiperActiveIndex - 1;
            onSlideChange?.(mockSwiperActiveIndex);
        };

        const handleNext = () => {
            mockSwiperActiveIndex = mockSwiperActiveIndex === allItems.length - 1 ? 0 : mockSwiperActiveIndex + 1;
            onSlideChange?.(mockSwiperActiveIndex);
        };

        return (
            <div data-testid="swiper" className={className}>
                {allItems.map((item: any, index: number) => (
                    <div key={`${String(item)}-${index}`} data-testid="swiper-slide">
                        {renderItem(item, index)}
                    </div>
                ))}
                <button type="button" onClick={handlePrev} title="Previous slide">
                    Prev
                </button>
                <button type="button" onClick={handleNext} title="Next slide">
                    Next
                </button>
            </div>
        );
    },
}));

jest.mock('@/assets/images/common/section-photo-placeholder.png', () => 'placeholder.png');

jest.mock('@/components/common/modal/Modal', () => {
    const ModalMock = ({
        isOpen,
        onClose,
        children,
        maxWidth,
        className,
    }: ModalProps & { maxWidth?: string; className?: string }) =>
        isOpen ? (
            <div data-testid="add-section-modal" data-max-width={maxWidth} data-classname={className}>
                <button data-testid="modal-close-btn" onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        ) : null;

    ModalMock.Title = ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>;
    ModalMock.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
    ModalMock.Actions = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;

    return { __esModule: true, Modal: ModalMock };
});

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, buttonStyle }: ButtonProps & { buttonStyle?: string }) => (
        <button onClick={onClick} disabled={disabled} data-button-style={buttonStyle}>
            {children}
        </button>
    ),
}));

const clickChoose = () => fireEvent.click(screen.getByRole('button', { name: PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION }));
const clickPrev = () => fireEvent.click(screen.getByTitle('Previous slide'));
const clickNext = () => fireEvent.click(screen.getByTitle('Next slide'));
const clickClose = () => fireEvent.click(screen.getByTestId('modal-close-btn'));

const getCallByTemplate = (templateId: any) => {
    const calls = mockRenderProgramSection.mock.calls.map((call) => call[0]);
    return calls.find((item) => item?.templateId === templateId);
};

const buildFiveShortDescriptions = () =>
    Array.from({ length: 5 }, () => PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT);

describe('AddSectionModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSelectTemplate = jest.fn();

    const renderModal = (overrides: Partial<AddSectionModalProps> = {}) => {
        const props: AddSectionModalProps = {
            isOpen: true,
            onClose: mockOnClose,
            onSelectTemplate: mockOnSelectTemplate,
            ...overrides,
        };

        render(<AddSectionModal {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockSwiperActiveIndex = 0;
        mockSwiperItems = [];
        mockSwiperExtraItems = [];
    });

    it('renders modal when open', () => {
        renderModal();
        expect(screen.getByTestId('add-section-modal')).toBeInTheDocument();
    });

    it('does not render modal when closed', () => {
        renderModal({ isOpen: false });
        expect(screen.queryByTestId('add-section-modal')).not.toBeInTheDocument();
    });

    it('passes maxWidth to Modal', () => {
        renderModal();
        expect(screen.getByTestId('add-section-modal')).toHaveAttribute('data-max-width', '90vw');
    });

    it('passes className to Modal', () => {
        renderModal();
        expect(screen.getByTestId('add-section-modal')).toHaveAttribute('data-classname');
    });

    it('renders swiper', () => {
        renderModal();
        expect(screen.getByTestId('swiper')).toBeInTheDocument();
    });

    it('renders choose button', () => {
        renderModal();
        expect(screen.getByRole('button', { name: PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION })).toBeInTheDocument();
    });

    it('choose button uses primary style', () => {
        renderModal();
        expect(screen.getByRole('button', { name: PROGRAMS_TEXT.BUTTON.CHOOSE_SECTION })).toHaveAttribute(
            'data-button-style',
            'primary',
        );
    });

    it('renders previous navigation button', () => {
        renderModal();
        expect(screen.getByTitle('Previous slide')).toBeInTheDocument();
    });

    it('renders next navigation button', () => {
        renderModal();
        expect(screen.getByTitle('Next slide')).toBeInTheDocument();
    });

    it('renders modal content container', () => {
        renderModal();
        expect(screen.getAllByTestId('add-section-modal-content')[0]).toBeInTheDocument();
    });

    it('calls onClose when modal close is clicked', () => {
        renderModal();
        clickClose();
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSelectTemplate when choose is clicked', () => {
        renderModal();
        clickChoose();
        expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when choose is clicked', () => {
        renderModal();
        clickChoose();
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('selects first template by default when saving', () => {
        renderModal();
        clickChoose();
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockSwiperItems[0]);
    });

    it('selects second template after next', () => {
        renderModal();
        clickNext();
        clickChoose();
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockSwiperItems[1]);
    });

    it('wraps to last template when clicking previous from start', () => {
        renderModal();
        clickPrev();
        clickChoose();
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockSwiperItems[mockSwiperItems.length - 1]);
    });

    it('wraps to first template when clicking next from last', () => {
        renderModal();
        clickPrev();
        clickNext();
        clickChoose();
        expect(mockOnSelectTemplate).toHaveBeenCalledWith(mockSwiperItems[0]);
    });

    it('calls renderProgramSection', () => {
        renderModal();
        expect(mockRenderProgramSection).toHaveBeenCalled();
    });

    it('passes isTemplate=true into renderProgramSection', () => {
        renderModal();
        expect(getCallByTemplate(mockSwiperItems[0])?.isTemplate).toBe(true);
    });

    it('passes sample title into renderProgramSection', () => {
        renderModal();
        expect(getCallByTemplate(mockSwiperItems[0])?.data?.title).toBe(PROGRAMS_TEXT.SECTION.TITLE_SAMPLE_TEXT);
    });

    it('passes sample description into renderProgramSection', () => {
        renderModal();
        expect(getCallByTemplate(mockSwiperItems[0])?.data?.description).toBe(
            PROGRAMS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT,
        );
    });

    it('provides 5 short descriptions only for SingleTitleQuintupleDescription', () => {
        renderModal();
        expect(getCallByTemplate(ProgramSectionTemplate.SingleTitleQuintupleDescription)?.data?.descriptions).toEqual(
            buildFiveShortDescriptions(),
        );
    });

    it('does not provide descriptions for non-SingleTitleQuintupleDescription', () => {
        renderModal();
        expect(getCallByTemplate(ProgramSectionTemplate.TextOnly)?.data?.descriptions).toBeUndefined();
    });

    it.each([
        [ProgramSectionTemplate.QuadImagesBottom, 4],
        [ProgramSectionTemplate.TripleImagesBottom, 3],
        [ProgramSectionTemplate.DualImagesBottom, 2],
        [ProgramSectionTemplate.SingleImageBottom, 1],
        [ProgramSectionTemplate.SingleImageTop, 1],
        [ProgramSectionTemplate.SingleImageRight, 1],
        [ProgramSectionTemplate.TextOnly, 0],
        [ProgramSectionTemplate.SingleTitleQuintupleDescription, 0],
    ] as Array<[ProgramSectionTemplate, number]>)(
        'provides correct placeholder images count for %s',
        (templateId, expectedCount) => {
            renderModal();
            expect(getCallByTemplate(templateId)?.data?.images).toHaveLength(expectedCount);
        },
    );

    it('unknown template id falls back to empty images array', () => {
        mockSwiperExtraItems = ['UNKNOWN_TEMPLATE_ID'] as any[];
        renderModal();
        expect(getCallByTemplate('UNKNOWN_TEMPLATE_ID')?.data?.images).toEqual([]);
    });
});
